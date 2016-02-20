# English description

## Chatbox

A simple and fast chatbox app based on Node.js and Socket.io that features a powerful control panel for admin to use.


#### Start Chatbox

```
$ cd chatbox
$ npm install
$ node index.js
```

#### Embed Chatbox

Now you can already visit `http://localhost:4321` to see your chatbox, but if you want to embed it into yout website, you need to include the following scripts to your web page:

```
<link rel="stylesheet" href="http://yourwebsite.com:port/client.css">
<script src="https://code.jquery.com/jquery-1.9.0.min.js"></script>
<script src="https://cdn.socket.io/socket.io-1.4.5.js"></script>
<script src="http://yourwebsite.com:port/client.js"></script>
```

The above scripts make ajax call to load Chatbox, if you want to load Chatbox synchronously, you just need to copy paste the HTML template in /public/chatbox.html into your page.


##### Demo

The chatbox is usually minimized at left bottom by default.

[http://lifeislikeaboat.com](http://lifeislikeaboat.com). 

[https://kn007.net/](https://kn007.net/)


##### Tips

Admin page is at `http://localhost:4321/admin.html`, default token is '12345'. 

Edit the token in `index.js` and put the same value in token field in Admin page then you are good to go. 

Remember that if you don't want to use port 4321, you need to change port in both `index.js` and `public/client.js` file.

Here's a quick way to change the port(e.g., change to 2231):
```
$ sed -i 's/var port =.*/var port = 2231;/g' ./public/client.js
$ sed -i 's/var port =.*/var port = 2231;/g' ./index.js
```

To change the token (e.g., change to 54321):
```
$ sed -i 's/var token =.*/var token = "54321";/g' ./index.js
```

If you are using reverse proxy, you need to set the value of `using_reverse_proxy` to 1 in `index.js`. Then in your reverse proxy server, add the real ip address to `X-Real-IP` header.

This app works great with light box style library, we recommend using fancybox. 

When embedding Chatbox to Wordpress, you can see [this page](/wordpress/README.md) to learn how to auto-sync the comment author name with chatbox visitor's nickname, so they don't need to enter nickname again.

If you are get error in front page:
```
failed: Error during WebSocket handshake: Unexpected response code: 400
```
This is almost always due to not using https (SSL). Websocket over plain http is vulnerable to proxies in the middle (often transparent) operating at the http layer breaking the connection.The only way to avoid this is to use SSL all the time - this gives websocket the best chance of working.


More info at [subsection 4.2.1 of the WebSockets RFC 6455](http://tools.ietf.org/html/rfc6455#section-4.2.1).



-----------------------------------------------------------
# 中文介绍



## 聊天盒

该聊天盒基于Node.js与Socket.io，充分利用了HTML5 Websocket双向通讯技术，在方便网站游客高速实时聊天的同时也提供网站管理员强大的控制面板，管理员可对全体游客或者特定游客进行各种操作。


#### 启动聊天盒

```
$ cd chatbox
$ npm install
$ node index.js
```

#### 内嵌聊天盒

直接访问`http://localhost:4321`即可进入聊天盒。

如果要嵌入你的网站中，直接在网页中引入下面的几个文件即可
    
```
<link rel="stylesheet" href="http://你的域名.com:端口/client.css">
<script src="https://code.jquery.com/jquery-1.9.0.min.js"></script>
<script src="https://cdn.socket.io/socket.io-1.4.5.js"></script>
<script src="http://你的域名.com:端口/client.js"></script>
```

此时Chatbox是异步加载的，如果希望和网页同步加载，你只需将/public/chatbox.html中的模板复制粘贴到你网页中的任意位置即可，上面引入文件的代码不需要更改。

##### 示例

聊天盒一般默认最小化于网页左下角

[http://lifeislikeaboat.com](http://lifeislikeaboat.com) 

[https://kn007.net/](https://kn007.net/)


##### 截图

![screenshot](/screenshots/Screenshot.png?raw=true "Screenshot")

##### 小贴士：

该软件默认使用的端口为4321，如果要更换默认端口，请同时修改位于`index.js`和`public/client.js`文件的端口值。


控制台的地址为`http://localhost:4321/admin.html`，默认的密码为“12345”，请尽早修改index.js文件里的Token值来改掉默认的管理员密码。


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


嵌入Wordpress后，如果希望同步评论者用户名，可参照[此说明](/wordpress/README.md) 。

如果你在调试时出现：
```
failed: Error during WebSocket handshake: Unexpected response code: 400
```
比较大的可能是在前端隐藏了端口并使用了http，具体可以看下面传送门的解释。简单来说Websocket通信在使用80端口转发时，80端口只负责连接，握手及通信在反代转发到后端端口通讯时可能会出错（在HTTP层被断开）。使用https可以避免这个问题，握手通讯皆用443端口。如果你不想使用https，那么建议你通过使用`http://localhost:4321`的方式来使用，而不隐藏端口；或是直接让nodejs监听80端口，而不通过反代。

更多资料可以参照WebSockets RFC 6455协议中的4.2.1章，[传送门](http://tools.ietf.org/html/rfc6455#section-4.2.1)。
