# Memento's Got Talent

Signup page for Memento's Got Talent. Static files, ready for GitHub Pages and a custom domain.

## Background video

Put the file here and refresh:

```
video/background.mp4
```

It autoplays muted and loops. Until that file exists, the page uses the stage background.

## Where signups go

Open `config.js` and set `notifyEmail` to the inbox that should receive them. The first signup sends that address a confirmation link. After you click it, later signups arrive as email.

## Put it on GitHub Pages

1. Push this folder to a GitHub repository.
2. Settings → Pages → deploy from branch `main`, folder `/ (root)`.
3. The site will be at `https://YOURNAME.github.io/REPO/`.

## Connect a domain

1. In the Pages settings, enter the domain.
2. GitHub will add a `CNAME` file. Commit it.
3. At your domain registrar, point DNS at GitHub Pages:
   - Apex domain: A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: CNAME to `YOURNAME.github.io`

DNS can take a while. GitHub will turn on HTTPS once it sees the records.
