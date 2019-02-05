
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