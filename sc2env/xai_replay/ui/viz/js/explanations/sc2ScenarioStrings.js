
// damage to enemy == score
// damage to friend == penalty
// destroyed enemy == bonus
// destroyed friend == penalty
var scoreFlavor = {};
scoreFlavor["damageToWeakEnemyGroup"]       = "score";
scoreFlavor["destoryToWeakEnemyGroup"]      = "bonus";
scoreFlavor["damageToStrongEnemyGroup"]     = "score";
scoreFlavor["destoryToStrongEnemyGroup"]    = "bonus";
scoreFlavor["damageToWeakFriendGroup"]      = "penalty";
scoreFlavor["destoryToWeakFriendGroup"]     = "penalty";
scoreFlavor["damageToStrongFriendGroup"]    = "penalty";
scoreFlavor["destoryToStrongFriendGroup"]   = "penalty";

scoreFlavor["damageToHydralisk"]            = "score";
scoreFlavor["damageToMarine"]               = "score";
scoreFlavor["damageToRoach"]                = "score";
scoreFlavor["damageToStalker"]              = "score";
scoreFlavor["damageToZealot"]               = "score";
scoreFlavor["damageToZergling"]             = "score";

var prettyPrintRewardName = {};
prettyPrintRewardName["damageToWeakEnemyGroup"]       = "damage to weak enemy groups";
prettyPrintRewardName["destoryToWeakEnemyGroup"]      = "destruction of weak enemy groups";
prettyPrintRewardName["damageToStrongEnemyGroup"]     = "damage to strong enemy groups";
prettyPrintRewardName["destoryToStrongEnemyGroup"]    = "destruction of  strong enemy groups";
prettyPrintRewardName["damageToWeakFriendGroup"]      = "damage to weak friendly groups";
prettyPrintRewardName["destoryToWeakFriendGroup"]     = "destruction of  weak friendly groups";
prettyPrintRewardName["damageToStrongFriendGroup"]    = "damage to strong friendly groups";
prettyPrintRewardName["destoryToStrongFriendGroup"]   = "destruction of strong friendly groups";

prettyPrintRewardName["damageToHydralisk"]            = "damage to enemy Hydalisks";
prettyPrintRewardName["damageToMarine"]               = "damage to enemy Marines";
prettyPrintRewardName["damageToRoach"]                = "damage to enemy Roaches";
prettyPrintRewardName["damageToStalker"]              = "damage to enemy Stalkers";
prettyPrintRewardName["damageToZealot"]               = "damage to enemy Zealots";
prettyPrintRewardName["damageToZergling"]             = "damage to enemy Zerglings";
prettyPrintRewardName["total score"]             = "total score";

function isXAIFeb2019MeetingDemoScenario(rewardNames){
    if (rewardNames.includes("damageToWeakEnemyGroup")&&
        rewardNames.includes("destoryToWeakEnemyGroup")&&
        rewardNames.includes("damageToStrongEnemyGroup")&&
        rewardNames.includes("destoryToStrongEnemyGroup")&&
        rewardNames.includes("damageToWeakFriendGroup")&&
        rewardNames.includes("destoryToWeakFriendGroup")&&
        rewardNames.includes("damageToStrongFriendGroup")&&
        rewardNames.includes("destoryToStrongFriendGroup") &&
        rewardNames.length == 8){
            return true;
    }
    else {
        return false;
    }
}
function sortRewardNamesIntoRelatedPairs(rewardNames){
    if (isXAIFeb2019MeetingDemoScenario(rewardNames)){
        var sorted = [];
        sorted.push("damageToWeakEnemyGroup");
        sorted.push("destoryToWeakEnemyGroup");
        sorted.push("damageToStrongEnemyGroup");
        sorted.push("destoryToStrongEnemyGroup");
        sorted.push("damageToWeakFriendGroup");
        sorted.push("destoryToWeakFriendGroup");
        sorted.push("damageToStrongFriendGroup");
        sorted.push("destoryToStrongFriendGroup");
        return sorted;
    }
    else {
        return rewardNames;
    }
}