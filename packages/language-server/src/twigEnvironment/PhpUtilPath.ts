export const PhpUtilPath = {
    getCraftTwig: require.resolve('./phpUtils/printCraftTwigEnvironment'),
    getDefinitionPhp: require.resolve('./phpUtils/definitionClassPsr4.php'),
    getCompletionPhp: require.resolve('./phpUtils/completeClassPsr4.php'),
} as const;
