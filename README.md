English description



# Chatbox

A simple chatbox app based on Socket.IO that allows file transfer and features a control panel for admin to use.


## How to use

```
$ cd chatbox
$ npm install
$ node index.js
```

And point your browser to `http://localhost:4321` to go to chatbox page.
Admin page is at `http://localhost:4321/admin.html`, default token is '12345'. 
Edit the token in `index.js` and put the same value in token field in Admin page then you are good to go. 


To embed this chatbox into a web page, just copy paste the content in public/index.html to the page you want to have chatbox, then change all included css file and JavaScript file path correctly. This app works great with light box library, I personally recommend using fancybox. 

## Future plan

* Improve chat history feature, currently only storing latest 20 messages
* Improve file transfer support, currently file larger than 10MB may fail to transfer due to timeout, and client side may freeze once receive large file.


## Demo

You can see how it looks at my own blog here: [http://lifeislikeaboat.com](http://lifeislikeaboat.com). The chatbox is minimized at left bottom by default.

## Screenshot

![screenshot](/Screenshot.png?raw=true "Screenshot")

![screenshot](/adminPanel.png?raw=true "AdminPanel")


-----------------------------------------------------------
中文介绍



# 聊天盒

该聊天盒基于Socket.io，可以进行小型文件的传输，并有控制台功能，管理员可对全体游客或者特定游客进行操作。


## 如何使用


```
$ cd chatbox
$ npm install
$ node index.js
```

在本地安装则直接访问`http://localhost:4321`即可进入聊天盒。
控制台的访问地址为`http://localhost:4321/admin.html`， 默认的密码为“12345”。
您可以通过修改index.js文件里的Token值来改掉默认密码。


如果想把聊天盒嵌入网站中，只要将`public/index.html`文件的内容复制粘贴到想要显示聊天盒的网页里，同时`public/index.html`中所有引入css和JavaScript文件地址需要修改正确。推荐配合fancybox插件使用来放大聊天盒里的图片。


## 下一步

* 改进聊天记录功能，目前只能存储最近的20条。
* 改进文件传输功能，目前对于稍大文件（大于10MB）的支持不好。


## 示例

您可以在我的博客试用该聊天盒，默认最小化于左下角： [http://lifeislikeaboat.com](http://lifeislikeaboat.com) 。


## 截图

![screenshot](/Screenshot.png?raw=true "Screenshot")

![screenshot](/adminPanel.png?raw=true "AdminPanel")