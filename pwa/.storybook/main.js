module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  core: {
    builder: "storybook-builder-vite",
  },
  async viteFinal(config, { configType }) {
    // configType = DEVELOPMENT / PRODUCTION
    return config;
  },
};
