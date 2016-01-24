English version



# Chatbox

A simple chatbox app adapted from Socket.io's chat room demo, it allows file transfer and features a control panel for admin.


## How to use

```
$ cd chatbox
$ npm install
$ node index.js
```

And point your browser to `http://localhost:4321` to go to chatbox page.
Admin page is at `http://localhost:4321/admin.html`, default token is '12345'. 
Edit the token in index.js and put the same value in token field in Admin page then you are good to go. 


To embed this chatbox into a web page, just copy paste the content in public/index.html to the page you want to have chatbox, then change all `http://localhost` to your domain name (remember to keep the port value if not 80). This app works great with light box library, I personally recommend using fancybox. 

## Future plan

Improve chat history feature, currently only storing latest 20 messages
Improve file transfer support, currently file larger than 10MB may fail to transfer due to timeout, and client side may freeze once receive large file.


## Demo

You can see how it looks at my own blog here: [http://lifeislikeaboat.com](http://lifeislikeaboat.com). The chatbox is minimized at left bottom by default.

## Screenshot

![screenshot](/Screenshot.png?raw=true "Screenshot")


-----------------------------------------------------------
中文版



# 聊天盒

该聊天盒修改自Socket.io的聊天室示例, 可以满足小型文件的传输，并且有控制台功能。


## 如何使用


```
$ cd chatbox
$ npm install
$ node index.js
```

在本地安装则直接访问`http://localhost:4321`即可进入聊天盒。
控制台的访问地址为`http://localhost:4321/admin.html`， 默认的密码为“12345”。
您可以通过修改index.js文件里的Token值来改掉默认密码。


如果想把聊天盒嵌入网站中，只要将 public/index.html 文件的内容复制粘贴到想要显示聊天盒的网页里，index.js 与 client.js中所有的`http://localhost`改成你自己的网址，如果使用的端口不是80，要记得包括端口值。建议配合fancybox插件使用，可以放大聊天盒里的图片。


## 下一步

改进聊天记录功能，目前只能存储最近的20条。
改进文件传输功能，目前对于稍大文件（大于10MB）的支持不好。


## 示例

您可以在我的博客试用该聊天盒，默认最小化于左下角： [http://lifeislikeaboat.com](http://lifeislikeaboat.com) 。


## 截图

![screenshot](/Screenshot.png?raw=true "Screenshot")
