# English description



##### Automatic Sync Wordpress Comment Author Name to Chatbox's Nickname

First, in `public/client.js`, add a line like this:
```
var wordpress_cookie = 'comment_author_fb594a9f9824f4e2bfe1ef5fb8f628ad';
var comment_author = '';
```
You can add it after `var port`, the value can get by `COOKIEHASH` or `md5(home_url());`.

Quick way to change the `wordpress_cookie`'s value:
```
$ sed -i "s/var wordpress_cookie =.*/var wordpress_cookie = 'comment_author_$(echo -n https://kn007.net | md5sum | cut -d ' ' -f1)';/g" ./public/client.js
```
Replaced the `https://kn007.net` to your blog url, no trailing slash.

Also in `public/client.js`, add a new action:
```
socket.on('wordpress check', function (data) {
  setTimeout(function(){syncCommentAuthorName();},1000);
});
function syncCommentAuthorName() {
  setTimeout(function(){syncCommentAuthorName();},2000);
  if(chatboxClient.getCookie(wordpress_cookie)==='') return;
  comment_author = decodeURI(chatboxClient.getCookie(wordpress_cookie));
  if(username===comment_author) return;
  askServerToChangeName(comment_author);
}
```

Then, find the `function init()`, prior to add the following code into the function:
```
if(chatboxClient.getCookie(wordpress_cookie)!=='') {
  comment_author = decodeURI(chatboxClient.getCookie(wordpress_cookie));
  chatboxClient.addCookie('chatname', comment_author);
}
```

Last step, find `user.socketList.push(socket)` in `index.js`, add following code before it.
```
socket.emit('wordpress check', {});  
```

Done.

If you need disallow change the chatbox nickname in Wordpress, find the `$('#socketchatbox-username').click(function(e)` in `public/client.js`, include this code:
```
if(comment_author!=='') return;
```

Another blog web software also can modify like this.


##### Demo

[https://kn007.net/](https://kn007.net/) (Chatbox will show after post comment)




-----------------------------------------------------------
# 中文介绍



##### 在Wordpress使用聊天盒时，同步评论者昵称

1.在`public/client.js`中增加一行（比如在`var port`后面）：
```
var wordpress_cookie = 'comment_author_fb594a9f9824f4e2bfe1ef5fb8f628ad';
var comment_author = '';
```
后面的hash字符可以通过wordpress输出`COOKIEHASH`或者通过`md5(home_url());`得出。

在shell下快速修改的方法：
```
$ sed -i "s/var wordpress_cookie =.*/var wordpress_cookie = 'comment_author_$(echo -n https://kn007.net | md5sum | cut -d ' ' -f1)';/g" ./public/client.js
```
其中`https://kn007.net`就是你的WP博客网址，替换成你的，谨记最后面不带斜杠。

2.在`public/client.js`中，注册动作：
```
socket.on('wordpress check', function (data) {
  setTimeout(function(){syncCommentAuthorName();},1000);
});
function syncCommentAuthorName() {
  setTimeout(function(){syncCommentAuthorName();},2000);
  if(chatboxClient.getCookie(wordpress_cookie)==='') return;
  comment_author = decodeURI(chatboxClient.getCookie(wordpress_cookie));
  if(username===comment_author) return;
  askServerToChangeName(comment_author);
}
```

3.在`index.js`中，在`user.socketList.push(socket)`前面加入：
```
socket.emit('wordpress check', {});  
```

4.在`public/client.js`中，找到`function init()`，在函数中最前面加入：
```
if(chatboxClient.getCookie(wordpress_cookie)!=='') {
  comment_author = decodeURI(chatboxClient.getCookie(wordpress_cookie));
  addCookie('chatname', comment_author);
}
```
如此便好。

如果你需要强制聊天盒昵称与Wordpress评论名称同步，禁止被修改，请在`public/client.js`找到`$('#socketchatbox-username').click(function(e)`，在其函数里面加入：
```
if(comment_author!=='') return;
```

最后要说的是，其他博客程序，修改方法类似。

以上修改可以参考本目录附带的`index.js`和`client.js`。


##### 示例

[https://kn007.net/](https://kn007.net/) （聊天盒需要评论后方才显示）

