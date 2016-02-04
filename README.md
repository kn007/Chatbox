# English description



## Chatbox

A simple chatbox app based on Socket.IO that allows file transfer and features a control panel for admin to use.


##### How to use

```
$ cd chatbox
$ npm install
$ node index.js
```

And point your browser to `http://localhost:4321` to go to chatbox page.

If you want the application to run in the background, just do:
```
$ nohup node index.js > /dev/null &

```
Or use tools like `forever` or `pm2` to run it. 

Admin page is at `http://localhost:4321/admin.html`, default token is '12345'. 

Edit the token in `index.js` and put the same value in token field in Admin page then you are good to go. 

If you want hide the port like `localhost` (Not `localhost:4321`) in front page, just change the `index.js` port to 4321, and setting `public/client.js` port to 80(or 443).

Quick way to change the port(e.g., change to 2231):
```
$ sed -i 's/var port =.*/var port = 2231;/g' ./public/client.js
$ sed -i 's/var port =.*/var port = 2231;/g' ./index.js
```

Quick way to change the token(e.g., change to 54321):
```
$ sed -i 's/var token =.*/var token = "54321";/g' ./index.js
```

If you are using reverse proxy, setting the `using_reverse_proxy` to 1 in `index.js`. In your reverse proxy server, add the real ip address to `X-Real-IP` header.

To embed this chatbox into a web page, just copy paste the content in public/index.html to the page you want to have chatbox, then change all included css file and JavaScript file path correctly. This app works great with light box library, I recommend using fancybox. 

When embedding this chatbox to Wordpress, you can see [this page](/wordpress/README.md) to know how to auto-sync the comment author name with chatbox visitor's nickname, so they don't need to enter nickname again.

If you are get error in front page:
```
failed: Error during WebSocket handshake: Unexpected response code: 400
```
This is almost always due to not using https (SSL). Websocket over plain http is vulnerable to proxies in the middle (often transparent) operating at the http layer breaking the connection.The only way to avoid this is to use SSL all the time - this gives websocket the best chance of working.


More info at [subsection 4.2.1 of the WebSockets RFC 6455](http://tools.ietf.org/html/rfc6455#section-4.2.1).

##### Future plan

* Improve chat history feature, currently only storing latest 20 messages
* Improve file transfer support, currently file larger than 10MB may fail to transfer due to timeout, and client side may freeze once receive large file.


##### Demo

The chatbox is usually minimized at left bottom by default.
[http://lifeislikeaboat.com](http://lifeislikeaboat.com). 


##### Screenshot

![screenshot](/screenshots/Screenshot.png?raw=true "Screenshot")

![screenshot](/screenshots/adminPanel.png?raw=true "AdminPanel")


-----------------------------------------------------------
# 中文介绍



## 聊天盒

该聊天盒基于Socket.io，可以进行小型文件的传输，并有控制台功能，管理员可对全体游客或者特定游客进行操作。


##### 如何使用

```
$ cd chatbox
$ npm install
$ node index.js
```

在本地安装则直接访问`http://localhost:4321`即可进入聊天盒。

如果你想让聊天盒在后台运行，可以用下面语句启动聊天盒：
```
$ nohup node index.js > /dev/null &

```
也可以使用`forever`或`pm2`工具来运行。

控制台的访问地址为`http://localhost:4321/admin.html`， 默认的密码为“12345”。

您可以通过修改index.js文件里的Token值来改掉默认的管理员密码。

如果你想让访问的地址隐藏端口号（如localhost，而非源代码中默认的localhost:4321），请修改`index.js`文件中的端口号为服务器后端的监听端口（如4321），其次修改`public/client.js`的端口为80（或443）即可。

通过Shell快速修改端口（比如改成2231）：
```
$ sed -i 's/var port =.*/var port = 2231;/g' ./public/client.js
$ sed -i 's/var port =.*/var port = 2231;/g' ./index.js
```

同理，可以快速修改管理员密码（比如改成54321）：
```
$ sed -i 's/var token =.*/var token = "54321";/g' ./index.js
```

如果你使用反向代理，请将`index.js`的`using_reverse_proxy`值修改为1，并在反向代理服务器添加X-Real-IP 头指向源IP。

如果想把聊天盒嵌入网站中，只要将`public/index.html`文件的内容复制粘贴到想要显示聊天盒的网页里，同时`public/index.html`中所有引入css和JavaScript文件地址需要修改正确。推荐配合fancybox插件使用来放大聊天盒里的图片。

嵌入Wordpress后，同步评论者用户名，可参照[此说明](/wordpress/README.md) 。

如果你在调试时出现：
```
failed: Error during WebSocket handshake: Unexpected response code: 400
```
比较大的可能是在前端隐藏了端口并使用了http，具体可以看下面传送门的解释。简单来说Websocket通信在使用80端口转发时，80端口只负责连接，握手及通信在反代转发到后端端口通讯时可能会出错（在HTTP层被断开）。使用https可以避免这个问题，握手通讯皆用443端口。如果你不想使用https，那么建议你通过使用`http://localhost:4321`的方式来使用，而不隐藏端口；或是直接让nodejs监听80端口，而不通过反代。

更多资料可以参照WebSockets RFC 6455协议中的4.2.1章，[传送门](http://tools.ietf.org/html/rfc6455#section-4.2.1)。


##### 下一步

* 改进聊天记录功能，目前只能存储最近的20条。
* 改进文件传输功能，目前对于稍大文件（大于10MB）的支持不好。


##### 示例

聊天盒一般默认最小化于网页左下角



[http://lifeislikeaboat.com](http://lifeislikeaboat.com) 

##### 截图

![screenshot](/screenshots/Screenshot.png?raw=true "Screenshot")

![screenshot](/screenshots/adminPanel.png?raw=true "AdminPanel")
