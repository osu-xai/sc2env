import argparse
import numpy as np
import os
from itertools import islice

import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch import autograd

import model
from logutil import TimeSeries
import imutil

device = torch.device("cuda")

print('Parsing arguments')
parser = argparse.ArgumentParser()
parser.add_argument('--batch_size', type=int, default=64)
parser.add_argument('--lr', type=float, default=2e-4)
parser.add_argument('--save_to_dir', type=str, default='checkpoints')
parser.add_argument('--load_from_dir', type=str, default='checkpoints')
parser.add_argument('--epochs', type=int, default=10)
parser.add_argument('--latent_size', type=int, default=16)
parser.add_argument('--start_epoch', type=int, default=0)
parser.add_argument('--lambda_gan', type=float, default=0.001)
parser.add_argument('--dataset', type=str, required=True)
parser.add_argument('--disc_updates_per_gen', type=int, default=5)

args = parser.parse_args()


from datasetutil.dataloader import CustomDataloader
from sc2converter import SC2FeatureMapConverter, QValueConverter

loader = CustomDataloader(args.dataset, batch_size=args.batch_size, img_format=SC2FeatureMapConverter, label_format=QValueConverter)
test_loader = CustomDataloader(args.dataset, batch_size=args.batch_size, img_format=SC2FeatureMapConverter, label_format=QValueConverter, fold='test')


print('Building model...')

discriminator = model.Discriminator().to(device)
generator = model.Generator(args.latent_size).to(device)
encoder = model.Encoder(args.latent_size).to(device)
value_estimator = model.ValueEstimator(args.latent_size).to(device)
predictor = model.Predictor(args.latent_size).to(device)
rgb = model.FeatureToRGB(18).to(device)

if args.start_epoch:
    discriminator.load_state_dict(torch.load('{}/disc_{}'.format(args.load_from_dir, args.start_epoch)))
    generator.load_state_dict(torch.load('{}/gen_{}'.format(args.load_from_dir, args.start_epoch)))
    encoder.load_state_dict(torch.load('{}/enc_{}'.format(args.load_from_dir, args.start_epoch)))
    value_estimator.load_state_dict(torch.load('{}/value_{}'.format(args.load_from_dir, args.start_epoch)))
    predictor.load_state_dict(torch.load('{}/predictor_{}'.format(args.load_from_dir, args.start_epoch)))
    rgb.load_state_dict(torch.load('{}/rgb_{}'.format(args.load_from_dir, args.start_epoch)))

# because the spectral normalization module creates parameters that don't require gradients (u and v), we don't want to 
# optimize these using sgd. We only let the optimizer operate on parameters that _do_ require gradients
# TODO: replace Parameters with buffers, which aren't returned from .parameters() method.
print('Building optimizers')
optim_disc = optim.Adam(filter(lambda p: p.requires_grad, discriminator.parameters()), lr=args.lr, betas=(0.0,0.9))
optim_gen = optim.Adam(generator.parameters(), lr=args.lr, betas=(0.0,0.9))
optim_gen_gan = optim.Adam(generator.parameters(), lr=args.lr, betas=(0.0,0.9))
optim_enc = optim.Adam(filter(lambda p: p.requires_grad, encoder.parameters()), lr=args.lr, betas=(0.0,0.9))
optim_class = optim.Adam(value_estimator.parameters(), lr=args.lr)
optim_predictor = optim.Adam(predictor.parameters(), lr=args.lr)
optim_rgb = optim.Adam(rgb.parameters(), lr=args.lr)

# use an exponentially decaying learning rate
scheduler_d = optim.lr_scheduler.ExponentialLR(optim_disc, gamma=0.99)
scheduler_g = optim.lr_scheduler.ExponentialLR(optim_gen, gamma=0.99)
scheduler_e = optim.lr_scheduler.ExponentialLR(optim_enc, gamma=0.99)
scheduler_c = optim.lr_scheduler.ExponentialLR(optim_class, gamma=0.99)
scheduler_p = optim.lr_scheduler.ExponentialLR(optim_predictor, gamma=0.99)
scheduler_rgb = optim.lr_scheduler.ExponentialLR(optim_rgb, gamma=0.99)
print('Finished building model')


def sample_z(batch_size, z_dim):
    # Normal Distribution
    z = torch.randn(batch_size, z_dim)
    z = normalize_vector(z)
    return z.to(device)


def normalize_vector(x, eps=.0001):
    norm = torch.norm(x, p=2, dim=1) + eps
    return x / norm.expand(1, -1).t()


def train(epoch, ts, max_batches=1000):
    for i, (data, labels) in enumerate(islice(loader, max_batches)):
        current_frame = torch.Tensor(np.array([d[0] for d in data])).cuda()
        next_frame = torch.Tensor(np.array([d[1] for d in data])).cuda()
        current_rgb = torch.Tensor(np.array([d[2] for d in data])).cuda()
        next_rgb = torch.Tensor(np.array([d[3] for d in data])).cuda()

        qvals = torch.Tensor(labels[:, 0]).cuda()
        mask = torch.Tensor(labels[:, 1]).cuda()

        optim_disc.zero_grad()
        optim_gen.zero_grad()
        optim_enc.zero_grad()

        if i % args.disc_updates_per_gen:
            discriminator.train()
            encoder.eval()
            generator.eval()

            # Update discriminator
            z = sample_z(args.batch_size, args.latent_size)
            d_real = 1.0 - discriminator(current_frame)
            d_fake = 1.0 + discriminator(generator(encoder(current_frame)))
            disc_loss = nn.ReLU()(d_real).mean() + nn.ReLU()(d_fake).mean()
            ts.collect('Disc Loss', disc_loss)
            ts.collect('Disc (Real)', d_real.mean())
            ts.collect('Disc (Fake)', d_fake.mean())
            disc_loss.backward()
            optim_disc.step()

            encoder.train()
            generator.train()
            value_estimator.train()
        else:
            # Update generator (based on output of discriminator)
            optim_gen.zero_grad()
            optim_enc.zero_grad()
            z = sample_z(args.batch_size, args.latent_size)
            d_gen = 1.0 - discriminator(generator(encoder(current_frame)))
            gen_loss = nn.ReLU()(d_gen).mean() * args.lambda_gan
            ts.collect('Gen Loss', gen_loss)
            gen_loss.backward()
            optim_gen.step()
            optim_enc.step()

        # Reconstruct pixels
        optim_enc.zero_grad()
        optim_gen.zero_grad()
        optim_class.zero_grad()
        optim_predictor.zero_grad()

        encoded = encoder(current_frame)
        reconstructed = generator(encoded)
        # Huber loss
        reconstruction_loss = F.smooth_l1_loss(reconstructed, current_frame)
        # Alternative: Good old-fashioned MSE loss
        #reconstruction_loss = torch.sum((reconstructed - current_frame)**2)
        ts.collect('Reconst Loss', reconstruction_loss)
        ts.collect('Z variance', encoded.var(0).mean())
        ts.collect('Reconst Pixel variance', reconstructed.var(0).mean())
        ts.collect('Z[0] mean', encoded[:,0].mean().item())

        # ValueEstimator outputs linear scores (logits)
        qval_predictions = value_estimator(encoder(current_frame))

        # MSE loss, but only for the available data
        qloss = torch.mean(mask * ((qvals - qval_predictions) **2))
        ts.collect('Q Value Regression Loss', qloss)

        # Reconstruction loss for the simulated next frame
        # But again, ~only~ for the frames we know the future state of
        predicted_successors = predictor(encoded)
        known_idx = mask.max(dim=1)[1]
        indices = known_idx.view(-1,1,1).expand(args.batch_size,1,args.latent_size)
        predicted_latent_points = predicted_successors.gather(1, indices)
        predicted_next_frame = generator(predicted_latent_points)

        pred_rec_loss = F.smooth_l1_loss(predicted_next_frame, next_frame)
        ts.collect('Pred Recon Loss', pred_rec_loss)

        loss = reconstruction_loss + qloss + pred_rec_loss
        loss.backward()

        # Separately from the other networks, run the RGB generator
        optim_rgb.zero_grad()
        rgb_loss = torch.mean((rgb(current_frame) - current_rgb)**2)
        rgb_loss.backward()
        ts.collect('RGB Loss', rgb_loss)
        optim_rgb.step()


        if i % 100 == 0:
            demo_real = format_demo_img(to_np(current_frame[0]), caption="Real Frame", qvals=qvals[0])
            demo_recon = format_demo_img(to_np(reconstructed[0]), caption="Reconstructed Frame", qvals=qval_predictions[0])
            imutil.show([demo_real, demo_recon], filename='epoch_{:04d}_{:04d}_recon.png'.format(epoch, i))

            generated = generator(sample_z(1, args.latent_size))
            demo_gen = format_demo_img(to_np(generated[0]), caption="Generated Frame")
            imutil.show(demo_gen, filename='epoch_{:04d}_{:04d}_gen.png'.format(epoch, i))

            demo_pred = format_demo_img(to_np(predicted_next_frame[0]), caption="Predicted Next Frame", qvals=qval_predictions[0])
            demo_next = format_demo_img(to_np(next_frame[0]), caption="True Next Frame", qvals=qval_predictions[0])
            imutil.show([demo_pred, demo_next], filename='epoch_{:04d}_{:04d}_pred_next.png'.format(epoch, i))

            vis_filename = 'epoch_{:04d}_{:04d}_full.png'.format(epoch, i)
            real_action = mask[0].argmax()
            real_reward = qvals[0, real_action]
            build_demo_visualization(current_frame[0], next_frame[0], real_action, real_reward, vis_filename)



        optim_class.step()
        optim_enc.step()
        optim_gen.step()
        optim_predictor.step()

        ts.print_every(n_sec=4)

    scheduler_e.step()
    scheduler_d.step()
    scheduler_g.step()
    print(ts)


def format_demo_img(feature_map, qvals=None, caption=None, filename=None):

    # Decompose the feature map
    from sc2util.representation import SC2_UNIT_IDS
    terrain_height = feature_map[0]
    friendly = feature_map[1]
    enemy = feature_map[2]
    unit_types = feature_map[3:3 + len(SC2_UNIT_IDS)]

    marines = unit_types[0]
    zealots = unit_types[4]
    zerglings = unit_types[8]
    hydras = unit_types[9]
    ultras = unit_types[11]

    health = feature_map[-3]
    shield = feature_map[-2]
    density = feature_map[-1]

    # Create a canvas with four maps
    canvas = np.ones((256, 256, 3))

    def draw_text(x, y, caption):
        textsize = draw.textsize(caption, font=font)

    canvas[16:16+64, 16:16+64, 0] = enemy
    canvas[16:16+64, 16:16+64, 1] = 0
    canvas[16:16+64, 16:16+64, 2] = friendly

    canvas[16:16+64, 96:96+64, 0] = marines
    canvas[16:16+64, 96:96+64, 1] = marines
    canvas[16:16+64, 96:96+64, 2] = marines

    canvas[16:16+64, 176:176+64, 0] = zerglings
    canvas[16:16+64, 176:176+64, 1] = zerglings
    canvas[16:16+64, 176:176+64, 2] = zerglings

    canvas[96:96+64, 16:16+64, 0] = zealots
    canvas[96:96+64, 16:16+64, 1] = zealots
    canvas[96:96+64, 16:16+64, 2] = zealots

    canvas[96:96+64, 96:96+64, 0] = hydras
    canvas[96:96+64, 96:96+64, 1] = hydras
    canvas[96:96+64, 96:96+64, 2] = hydras

    canvas[96:96+64, 176:176+64, 0] = ultras
    canvas[96:96+64, 176:176+64, 1] = ultras
    canvas[96:96+64, 176:176+64, 2] = ultras

    canvas *= 255

    # Now draw all the text captions
    from PIL import Image, ImageFont, ImageDraw
    img = Image.fromarray(canvas.astype('uint8'))
    # Should be available on Ubuntu 14.04+
    FONT_FILE = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
    font = ImageFont.truetype(FONT_FILE, 10)
    draw = ImageDraw.Draw(img)

    def draw_text(x, y, caption):
        textsize = draw.textsize(caption, font=font)
        #draw.rectangle([(x, y), textsize], fill=(0,))
        draw.multiline_text((x,y), caption, font=font, fill=(0,0,0,255))

    draw_text(0, 0, caption)
    draw_text(16, 80, "Units")
    draw_text(96, 80, "Marines")
    draw_text(176, 80, "Zerglings")

    draw_text(16, 166, "Zealots")
    draw_text(96, 166, "Hydralisks")
    draw_text(176, 166, "Ultralisks")

    if qvals is not None:
        draw_text(68, 192, "Reward Estimates")
        draw_text(58, 202, "0. Top Right (Q1): {:.2f}".format(qvals[2]))
        draw_text(58, 212, "1. Bot Right (Q4): {:.2f}".format(qvals[1]))
        draw_text(58, 222, "2. Bot Left (Q3):  {:.2f}".format(qvals[0]))
        draw_text(58, 232, "3. Top Left (Q2):  {:.2f}".format(qvals[3]))

    canvas = np.array(img)
    return canvas


def build_demo_visualization(current_frame, real_next_frame, real_action, real_reward, filename):
    z = encoder(current_frame.unsqueeze(0))
    current_frame_rgb = rgb(current_frame.unsqueeze(0)).squeeze(0)
    estimated_rewards = value_estimator(z)
    predicted_next_frames = generator(predictor(z))
    predicted_next_frames_rgb = rgb(predicted_next_frames)
    autoencoded = generator(z)
    autoencoded_rgb = rgb(autoencoded).squeeze(0)

    unfamiliarity = torch.sum((autoencoded - current_frame)**2)
    surprise = torch.sum((predicted_next_frames[real_action] - real_next_frame)**2)

    canvas = np.ones((1024, 1024, 3)) * 255

    # Top row: Input frame and autoencoding
    canvas[:256, :256] = format_demo_img(to_np(current_frame), caption="Real x_t")
    canvas[:256, 256:512] = format_demo_img(to_np(autoencoded[0]), caption="Autoencoded x_t")
    canvas[:256, 512:768] = np.moveaxis(to_np(current_frame_rgb), 0, -1) * 255
    canvas[:256, 768:] = np.moveaxis(to_np(autoencoded_rgb), 0, -1) * 255

    # Mid row: Predicted outcomes for possible actions
    for i in range(4):
        caption = "Pred. Action {} Reward {:.03f}".format(i, estimated_rewards[0][i])
        pixels = to_np(predicted_next_frames[i])
        pixels = format_demo_img(pixels, caption=caption)
        canvas[256:512, 256*i:256*(i+1)] = pixels

    # Third row: RGB
    for i in range(4):
        pixels = to_np(predicted_next_frames_rgb[i])
        pixels = np.moveaxis(pixels, 0, -1)
        canvas[512:768, 256*i:256*(i+1)] = pixels * 255

    # Bottom row: Real outcome, ground truth
    caption = "Real Action {} Reward {:.03f}".format(real_action, real_reward)
    real_img = format_demo_img(to_np(real_next_frame), caption=caption)
    canvas[768:, 256*real_action:256*(real_action+1)] = real_img

    # Now draw all the text captions
    from PIL import Image, ImageFont, ImageDraw
    img = Image.fromarray(canvas.astype('uint8'))
    # Should be available on Ubuntu 14.04+
    FONT_FILE = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
    font = ImageFont.truetype(FONT_FILE, 10)
    draw = ImageDraw.Draw(img)

    def draw_text(x, y, caption):
        textsize = draw.textsize(caption, font=font)
        draw.multiline_text((x,y), caption, font=font, fill=(0,0,0,255))

    draw_text(10, 970, "Real action: {} reward {:.3f}".format(real_action, real_reward))
    draw_text(10, 980, "L2 Unfamiliarity: {:.3f}".format(unfamiliarity))
    draw_text(10, 990, "L2 Surprise: {:.3f}".format(surprise))

    draw_text(512, 0, "RGB visual x_t")
    draw_text(768, 0, "RGB visual G(E(x_t))")

    canvas = np.array(img)
    imutil.show(canvas, filename=filename)


def to_np(tensor):
    return tensor.detach().cpu().numpy()


def make_counterfactual_trajectory(x, target_action, iters=60, initial_speed=0.1,
                                   speed_decay=0.99, mu=0.9, stability_coefficient=1.0,
                                   closeness_coefficient=.01):
    trajectory = []

    z0 = encoder(x)[0]
    z = z0.clone()
    original_qvals = value_estimator(z0)
    losses = []

    speed = initial_speed
    velocity = torch.zeros(z.size()).to(device)

    for i in range(iters):
        cf_loss = 0
        qvals = value_estimator(z)
        for class_idx in range(len(qvals)):
            if class_idx == target_action:
                cf_loss += (1 - qvals[class_idx]) ** 2
            else:
                cf_loss += stability_coefficient * (qvals[class_idx] - original_qvals[class_idx])**2

        cf_loss += closeness_coefficient * torch.norm(z - z0, p=2)

        dc_dz = autograd.grad(cf_loss, z, cf_loss)[0]
        losses.append(float(cf_loss))

        v_prev = velocity
        velocity = mu * velocity - speed * dc_dz
        z += -mu * v_prev + (1 + mu) * velocity
        z /= torch.norm(z)
        speed *= speed_decay
        trajectory.append([to_np(z)])

    distance = float(torch.norm(z - z0, p=2))
    print('Counterfactual distance {:.3f} initial loss {:.3f} final loss {:.3f}'.format(
        distance, losses[0], losses[-1]))
    return np.array(trajectory)


def make_video(output_video_name, trajectory, whatif=""):
    print('Generating video from trajectory shape {}'.format(trajectory.shape))
    generator.eval()
    v = imutil.VideoMaker(output_video_name)

    z_0 = torch.Tensor(trajectory[0]).to(device)
    original_samples = generator(z_0)[0]
    original_qvals = value_estimator(z_0)[0]
    left_pixels = format_demo_img(
        to_np(original_samples),
        qvals=to_np(original_qvals),
        caption='Reality')
    for z in torch.Tensor(trajectory):
        z = z.to(device)
        samples = generator(z)[0]
        qvals = value_estimator(z)[0]
        right_pixels = format_demo_img(
            to_np(samples),
            qvals=to_np(qvals),
            caption='What If: {}'.format(whatif))
        pixels = np.concatenate([left_pixels, right_pixels], axis=1)
        v.write_frame(pixels)
    v.finish()


def main():
    os.makedirs(args.save_to_dir, exist_ok=True)
    batches_per_epoch = len(loader)
    ts_train = TimeSeries('Training', batches_per_epoch * args.epochs)
    for epoch in range(args.epochs):
        print('starting epoch {}'.format(epoch))
        train(epoch, ts_train, max_batches=batches_per_epoch)
        print(ts_train)

        data, _ = next(i for i in test_loader)
        for target_action in range(4):
            current_frame = torch.Tensor(np.array([d[0] for d in data])).cuda()
            cf_trajectory = make_counterfactual_trajectory(current_frame, target_action)
            filename = 'cf_epoch_{:03d}_{}'.format(epoch, target_action)
            make_video(filename, cf_trajectory, whatif=' action={}'.format(target_action))

        torch.save(discriminator.state_dict(), os.path.join(args.save_to_dir, 'disc_{}'.format(epoch)))
        torch.save(generator.state_dict(), os.path.join(args.save_to_dir, 'gen_{}'.format(epoch)))
        torch.save(encoder.state_dict(), os.path.join(args.save_to_dir, 'enc_{}'.format(epoch)))
        torch.save(value_estimator.state_dict(), os.path.join(args.save_to_dir, 'value_{}'.format(epoch)))
        torch.save(predictor.state_dict(), os.path.join(args.save_to_dir, 'predictor_{}'.format(epoch)))
        torch.save(rgb.state_dict(), os.path.join(args.save_to_dir, 'rgb_{}'.format(epoch)))


if __name__ == '__main__':
    main()
