# English description



##### Automatic Sync Wordpress Comment Author Name to Chatbox's Nickname

In Wordpress, add the following code in functions.php：
```
add_action('init', 'setting_chatname_cookie', 1);
function setting_chatname_cookie(){
	if (is_user_logged_in()) {
		$current_user = wp_get_current_user();
		setrawcookie('chatname', $current_user->user_login, time() + YEAR_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN);
	}elseif (isset($_COOKIE["comment_author_" . COOKIEHASH]) && $_COOKIE["comment_author_" . COOKIEHASH] !='') {
		setrawcookie('chatname', urldecode($_COOKIE["comment_author_" . COOKIEHASH]), time() + YEAR_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN);
	}
}
```
Done. 

If you was using a cache plugin, when guest post comment, it may not work to setcookie. So you could do the following way to fix it.

First, in `public/client.js`, add a line like this:
```
var comment_author = 'comment_author_fb594a9f9824f4e2bfe1ef5fb8f628ad';
```
You can add it after `var port`, the value can get by `COOKIEHASH` or `md5(home_url());`.

Quick way to change the `comment_author`'s value:
```
$ sed -i "s/var comment_author =.*/var comment_author = 'comment_author_$(echo -n https://kn007.net | md5sum | cut -d ' ' -f1)';/g" ./public/client.js
```
Replaced the `https://kn007.net` to your blog url, no trailing slash.

Then, in `public/client.js`, find the `function init ()`, prior to add the following code into the function:
```
if(getCookie(comment_author)!=='') {
  addCookie('chatname', getCookie(comment_author));
  askServerToChangeName(decodeURI(getCookie(comment_author)));
}
```
Done.

If you need disallow change the chatbox nickname in Wordpress, find the `$('#socketchatbox-username').click(function(e)` in `public/client.js`, include this code:
```
if(getCookie(comment_author)!='') return;
```

Another blog web software also can modify like this.


##### Demo

[https://kn007.net/](https://kn007.net/)




-----------------------------------------------------------
# 中文介绍



##### 在Wordpress使用聊天盒时，同步评论者昵称

在WP主题的functions.php中添加如下函数：
```
add_action('init', 'setting_chatname_cookie', 1);
function setting_chatname_cookie(){
	if (is_user_logged_in()) {
		setcookie('chatname','');
		$current_user = wp_get_current_user();
		setrawcookie('chatname', $current_user->user_login, time() + YEAR_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN);
	}elseif (isset($_COOKIE["comment_author_" . COOKIEHASH]) && $_COOKIE["comment_author_" . COOKIEHASH] !='') {
		setcookie('chatname','');
		setrawcookie('chatname', $_COOKIE["comment_author_" . COOKIEHASH], time() + YEAR_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN);
	}
}
```
即可实现。如果你使用了缓存插件，可能会导致访客评论，init并不会正确setcookie，那么使用以下方法，能保证解决。

1.在`public/client.js`中增加一行（比如在`var port`后面）：
```
var comment_author = 'comment_author_fb594a9f9824f4e2bfe1ef5fb8f628ad';
```
后面的hash字符可以通过wordpress输出`COOKIEHASH`或者通过`md5(home_url());`得出。

在shell下快速修改的方法：
```
$ sed -i "s/var comment_author =.*/var comment_author = 'comment_author_$(echo -n https://kn007.net | md5sum | cut -d ' ' -f1)';/g" ./public/client.js
```
其中`https://kn007.net`就是你的WP博客网址，替换成你的，谨记最后面不带斜杠。

2.在`public/client.js`中，找到`function init ()`，在函数中最前面加入：
```
if(getCookie(comment_author)!=='') {
  addCookie('chatname', getCookie(comment_author));
  askServerToChangeName(decodeURI(getCookie(comment_author)));
}
```
如此便好。

如果你需要强制聊天盒昵称与Wordpress评论名称同步，禁止被修改，请在`public/client.js`找到`$('#socketchatbox-username').click(function(e)`，在其函数里面加入：
```
if(getCookie(comment_author)!='') return;
```

最后要说的是，其他博客程序，修改方法类似。

以上修改可以参考本目录附带的`client.js`。


##### 示例

[https://kn007.net/](https://kn007.net/) 

