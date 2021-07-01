module.exports = {
  theme:"antdocs",
  title: "忘忧客の个人空间",
  description: "记录我的工作、学习、生活888888。",
  base: "/",
  dest: "./dist",
  head: [
    ["link",{ rel: "icon",href: "/assets/logo.png" }]
  ],
  markdown: {
    lineNumbers: false,
  },
  themeConfig: {
    smoothScroll: true,
    nav: require("./config/nav"),
    sidebar: require("./config/sidebar"),
    lastUpdated: "Last Updated",
    repo: "https://github.com/cxhan",
    editLinks: false,
  },
};