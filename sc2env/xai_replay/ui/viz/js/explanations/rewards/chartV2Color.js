function addColorToBars(rawChartData) {
    var rd = rawChartData;
    //possible issue: if rawChartData has different number of bars for each action colors will NOT be consistent
    //possible solution: base it off of rName variable?
    //possible solution: don't use ch.actionRewardForNameMap variable in colorTests?
    //rd.colors = ['#00AAAA', '#0055CC', '#00CC00', '#004400', '#0000AA', '#006666', '#002222', '#000044']
    //rd.colors = ['#7293CB','#E1974C',  '#84BA5B','#D35E60', '#9067A7', '#AB6857',  '#CCC210',  '#000044'];
    rd.colors = ['#1B2D4B','#E1974C',  '#30481E','#D7E400', '#372541', '#9AE004',  '#CCC210',  '#000044'];


    for (var i in rd.actions) {
        for (var j in rd.actions[i].bars) {
            rd.actions[i].bars[j].color = rd.colors[j];
        }
        rd.actions[i].color = 'rgba(150,150,150,0.5)';
    }

    return rd;
}