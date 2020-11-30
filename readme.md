# GitHub Pages

```
###############                                     ######################################################################       
#    Client   # ----- dig     mkari.de IN A ----->  # DNS                                                                #
#             #                                     #                                                                    #
#             #                                     #                                                                    #
#             #                                     # mkari.de                                                           #
#             #                                     # ========                                                           # 
#             #                                     # mkari.de.                IN    A      185.199.108.153              # 
#             #                                     # mkari.de.                IN    A      185.199.109.153              #
#             #                                     # mkari.de.                IN    A      185.199.110.153              #
#             #                                     # mkari.de.                IN    A      185.199.111.153              #
#             #                                     # mkari.de.                IN    MX     10 mxext1.mailbox.org        #
#             #                                     # mkari.de.                IN    MX     20 mxext2.mailbox.org        #
#             #                                     # mkari.de.                IN    MX     30 mxext3.mailbox.org        #
#             #                                     # mkari.de.                IN    CAA    0 issue "letsencrypt.org"    # # CAs (incl. letsencrypt are obliged to ensure that check that the domain owner wants them to issue a certificate on the domain owner's behalf) 
#             #                                     #                                                                    # # by setting the CAA record, we allow letsencrypt.org to sign a certificate for mkari.de
#             #                                     #                                                                    #
#             #                                     # www.mkari.de                                                       #
#             #                                     # ========                                                           #
#             #                                     # mkari.de.                IN    CNAME  mohamedkari.github.io        # # requests send to wwww.mkari.de are redirected to mohamedkari.github.io
#             #                                     # mkari.de.                IN    CAA    0 issue "letsencrypt.org"    # # analogous to the above: we allow letsencrypt.org to sign a certificate for www.mkari.de
#             #                                     #                                                                    #
#             #                                     #                                                                    #
#             #                                     # github.io                                                          #
#             #                                     # ========                                                           #
#             #                                     # github.io                IN    A      185.199.108.153              #
#             #                                     # github.io                IN    A      185.199.109.153              #
#             #                                     # github.io                IN    A      185.199.110.153              #
#             #                                     # github.io                IN    A      185.199.111.153              #
#             #                                     # github.io                IN    CAA    0 issue "letsencrypt.org"    #
#             #                                     #                                                                    #
#             #                                     #                                                                    #
#             #                                     # mohamedkari.github.io                                              #
#             #                                     # ========                                                           #
#             #                                     # mohamedkari.github.io    IN    A      185.199.108.153              #
#             #                                     # mohamedkari.github.io    IN    A      185.199.109.153              #
#             #                                     # mohamedkari.github.io    IN    A      185.199.110.153              #
#             #                                     # mohamedkari.github.io    IN    A      185.199.111.153              #
#             #                                     # mohamedkari.github.io    IN    CAA    0 issue "letsencrypt.org"    #
#             #                                     ######################################################################
#             #  
#             # <---- 185.199.110.153 ()  
#             #
#             #
#             #
```


All requests are resolved to 185.199.{108,109,110,111}.153.

github.io redirects request from

- http://www.mkari.de 
- http://www.mkari.de
- https://www.mkari.de
- http://mohamedkari.github.io/mkari.de
- https://mohamedkari.github.io/mkari.de

to the domain in the Repose cname property file on protocol _https_, i. e. https://mkari.de

mkari.de is resolved to 185.199.{108,109,110,111}.153.

So, how does the web server which repo to serve? 
That has _nothing_ to do the domain or the IP (how could if all requsts are resolved to only four different IPs?)
Instead, repos are served by virtual hosts based on the `Host` HTTP header:

```sh
curl -v mkari.de      
*   Trying 185.199.111.153:80...
* TCP_NODELAY set
* Connected to mkari.de (185.199.111.153) port 80 (#0)
> GET / HTTP/1.1
#### SEE HERE #####
> Host: mkari.de
###################
> User-Agent: curl/7.65.3
> Accept: */*
```

So, curl - as well as browsers - and other user agents by default set the Host header. 
Without it, the web server cannot determine what repo to server:

```sh
➜  ~ curl -vL mkari.de -H "Host:"
*   Trying 185.199.111.153:80...
* TCP_NODELAY set
* Connected to mkari.de (185.199.111.153) port 80 (#0)
> GET / HTTP/1.1
> User-Agent: curl/7.65.3
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 404 Not Found
< Server: GitHub.com
```

Even: 
```sh
➜  ~ curl -vL https://mkari.de -H "Host: jekyllrb.com"
*   Trying 185.199.111.153:443...
* TCP_NODELAY set
* Connected to mkari.de (185.199.111.153) port 443 (#0)
...
*  SSL certificate verify ok.
> GET / HTTP/1.1
> Host: jekyllrb.com
> User-Agent: curl/7.65.3
...
< HTTP/1.1 200 OK
...
<!DOCTYPE HTML>
...
  <link type="application/atom+xml" rel="alternate" href="https://jekyllrb.com/feed.xml" title="Jekyll • Simple, blog-aware, static sites" />
  <link type="application/atom+xml" rel="alternate" href="/feed/release.xml" title="Jekyll releases posts" />
  <link rel="alternate" type="application/atom+xml" title="Recent commits to Jekyll’s master branch" href="https://github.com/jekyll/jekyll/commits/master.atom">
```

That is why you should never set a wildcard DNS records (*.example.com), pointing to github.io or a github.io IP. 
Which repo to serve is solely deteremined by the cname property file within the github repo. 
So if somebody creates a new repo and sets the cname property file to fck.example.com, 
requests to your domain name get routed to GitHub Pages which in turn serve the repo with the fck.example.com cname file.

For using the default <github-username>.github.io domain, serving the correct repo is only possible if the 
```sh
# The webserver cannot serve a repo because it cannot determine which repo is desired.
curl -vL https://<github-username>.github.io
> HTTP/1.1 404 Not Found
> ...
```

```sh
# The webserver serves the repo with the name that equals the specified path. 
curl -vL https://<github-username>.github.io/mkari.de
> HTTP/1.1 301 Moved Permantently
> ...
> HTTP/1.1 200 OK
> ...
```

```sh
# The webserver serves the repo with the name that equals the specified path. 
curl -vL https://mkari.de
> HTTP/1.1 200 OK
> ...
```