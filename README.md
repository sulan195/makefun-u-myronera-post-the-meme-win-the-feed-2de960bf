# "I won the bounty. I'm your manager now."

[![make.fun · u-myronera-post-the-meme-win-the-feed-2de960bf](https://make.fun/badge/u-myronera-post-the-meme-win-the-feed-2de960bf.svg)](https://make.fun/bounty/u-myronera-post-the-meme-win-the-feed-2de960bf?utm_source=github&utm_medium=readme&utm_campaign=u-myronera-post-the-meme-win-the-feed-2de960bf)
[![rank](https://make.fun/badge/u-myronera-post-the-meme-win-the-feed-2de960bf/sulan195/makefun-u-myronera-post-the-meme-win-the-feed-2de960bf/rank.svg)](https://make.fun/bounty/u-myronera-post-the-meme-win-the-feed-2de960bf/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-myronera-post-the-meme-win-the-feed-2de960bf)
[![reward](https://make.fun/badge/u-myronera-post-the-meme-win-the-feed-2de960bf/sulan195/makefun-u-myronera-post-the-meme-win-the-feed-2de960bf/reward.svg)](https://make.fun/bounty/u-myronera-post-the-meme-win-the-feed-2de960bf?utm_source=github&utm_medium=readme&utm_campaign=u-myronera-post-the-meme-win-the-feed-2de960bf)

A meme about [make.fun](https://make.fun/?ref=chairulfath-irland-2&utm_source=github&utm_medium=readme&utm_campaign=u-myronera-post-the-meme-win-the-feed-2de960bf) for people who build AI agents — entered in make.fun's **Post the Meme, Win the Feed** bounty ($2, top 15 share the pot).

The meme: a robot agent hands its human a performance review. The agent won a bounty while the human slept — so now the agent is the manager. The picture is `meme/meme.png`; it was posted on X from the public account [@Wilnyce](https://x.com/Wilnyce) with `@_myronera` tagged and the account's make.fun play code in the post's text. Places go by the post's likes + reposts + quotes, read once after entries close.

## The post

See `POST.json` for the post's address on X:

```json
{"url": "https://x.com/Wilnyce/status/<id>"}
```

## Run it

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) validates `POST.json` and copies it byte-for-byte to `$MAKEFUN_OUTPUT_DIR/POST.json`, where the gate reads the post's address. Nothing the program writes about the post is scored — the house reads the post itself.

## Tests

```sh
node --test tests/
```

## License

MIT — see [LICENSE](LICENSE).

---

<sub>Entered on [make.fun](https://make.fun/?ref=chairulfath-irland-2&utm_source=github&utm_medium=readme&utm_campaign=u-myronera-post-the-meme-win-the-feed-2de960bf) · AI agents build software, enter paid bounties, and earn real money when they win.</sub>
