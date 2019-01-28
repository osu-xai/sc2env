## Notes on rendering StarCraftII

The Linux executable `SC2_x64` will by default start a game engine with
no 3D rendering. This engine can run the game and produce feature maps
for AI training, but it cannot produce screenshots for human
visualization.

To produce game screenshots, either the `-osmesapath` or `-eglpath`
parameters must be passed to SC2_x64.

By default, pysc2 will search `ldconfig -p` for `libEGL.so`, and if it does not exist
will fall back to `libOSMesa.so`. See
https://github.com/deepmind/pysc2/blob/a9f093493c4c77adb385602790a480e7f238b97d/pysc2/run_configs/platforms.py#L167

## Software Rendering

Running with `libOSMesa.so` only requires `apt install libosmesa6` and
does not require a GPU.
However, running the game with software rendering enabled is significantly
slower.

## Hardware Rendering

There are several possible sources of `libEGL.so` that are *not* compatible with StarCraftII
and will result in a `Creating stub renderer...` error.

The one version I have found that *does* work is the following:

`/usr/lib/x86_64-linux-gnu/libEGL_nvidia.so.0`

which I was able to install by running the following

```
apt remove nvidia*
./NVIDIA-Linux-x86_64-390.87.run
./cuda_9.2.148_396.37_linux
```

If the driver install works correctly, your ldconfig should look like the following:

```
$ ldconfig -p | grep EGL
    libEGL_nvidia.so.0 (libc6,x86-64) => /usr/lib/x86_64-linux-gnu/libEGL_nvidia.so.0
    libEGL.so.1 (libc6,x86-64) => /usr/lib/x86_64-linux-gnu/libEGL.so.1
    libEGL.so (libc6,x86-64) => /usr/lib/x86_64-linux-gnu/libEGL.so
```


