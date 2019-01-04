function buildDummyChart(rewardCount) {
    var chart = {};
    chart.actions = [];
    chart.actionForNameMap = {};
    chart.actionNames = [];
    chart.actionRewardForNameMap = {};
    chart.actionRewardNames = [];
    chart.rewards = {};
    chart.rewardNames = [];
    var posOrNeg = 0;
    for (var i = 0; i < 4; i++){
        var action = {};
        action.bars = [];
        action.name = "action_"+ i;
        action.value = Number(0);
        for (var j = 0; j < rewardCount; j++){
            var bar = {};
            bar.fullName = "action_"+ i+ ".reward_" + j;
            bar.name = "reward_" + j;
            if (!chart.rewardNames.includes(bar.name)) {
                chart.rewardNames.push(bar.name);
                chart.rewards[bar.name] = {};
                chart.rewards[bar.name].name = bar.name;
            }
            if (posOrNeg % 2 == 0){
                bar.value = ((Number(i) + 1) * (Number(j)+ 1)) * 10;
            }
            else {
                bar.value = -((Number(i) + 1) * (Number(j)+ 1)) * 10;
            }
            action.value = Number(action.value) + Number(bar.value);
            action.bars.push(bar);
            chart.actionRewardForNameMap[bar.fullName] = bar;
            chart.actionRewardNames.push(bar.fullName);
            posOrNeg++;
        }
        chart.actions.push(action);
        chart.actionForNameMap[action.name] = action;
        chart.actionNames.push(action.name);
    }

    return chart;
}
function buildChartFromActionInfos(actionInfos){
    chart = {};
    chart.actions = [];
    for(var i in actionInfos) {
        var action = {};
        action.bars = [];
        var actionInfo = actionInfos[i];
        action.name = actionInfo[0];
        action.value = Number(actionInfo[1]);
        var barInfos = actionInfo[2];
        for (var j in barInfos){
            var barInfo = barInfos[j];
            var bar = {};
            bar.name = barInfo[0];
            bar.value = Number(barInfo[1]);
            action.bars.push(bar);
        }
        chart.actions.push(action);
    }
    return chart;
}
function getSeeSawChart() {
    var actionInfos = [];
    actionInfos.push([ "action_0", 20, [[ "reward_0" , 10],  ["reward_1", -20], ["reward_2", 30] ]]);
    actionInfos.push([ "action_1", -50, [[ "reward_0" , -40], ["reward_1", 50],  ["reward_2", -60] ]]);
    actionInfos.push([ "action_2", 80, [[ "reward_0" , 70],  ["reward_1", -80], ["reward_2", 90] ]]);
    actionInfos.push([ "action_3", -110, [[ "reward_0" , -100],["reward_1", 110], ["reward_2", -120] ]]);
    var ch = buildChartFromActionInfos(actionInfos);
    ch = addConvenienceDataStructures(ch);
    return ch;
}

function getAllPositivesChart() {
    var actionInfos = [];
    actionInfos.push([ "action_0", 0, [[ "reward_0" , 0], ["reward_1", 0], ["reward_2", 0] ]]);
    actionInfos.push([ "action_1", 100, [[ "reward_0" , 40], ["reward_1", 0], ["reward_2", 60] ]]);
    actionInfos.push([ "action_2", 240, [[ "reward_0" , 70], ["reward_1", 80], ["reward_2", 90] ]]);
    actionInfos.push([ "action_3", 330, [[ "reward_0" , 100],["reward_1", 110],["reward_2", 120] ]]);
    var ch = buildChartFromActionInfos(actionInfos);
    ch = addConvenienceDataStructures(ch);
    return ch;
}

function getAllNegativesChart() {
    var actionInfos = [];
    actionInfos.push([ "action_0", -60, [[ "reward_0" , -10], ["reward_1", -20], ["reward_2", -30] ]]);
    actionInfos.push([ "action_1", -150, [[ "reward_0" , -40], ["reward_1", -50], ["reward_2", -60] ]]);
    actionInfos.push([ "action_2", -240, [[ "reward_0" , -70], ["reward_1", -80], ["reward_2", -90] ]]);
    actionInfos.push([ "action_3", -330, [[ "reward_0" , -100],["reward_1", -110],["reward_2", -120] ]]);
    var ch = buildChartFromActionInfos(actionInfos);
    ch = addConvenienceDataStructures(ch);
    return ch;
}