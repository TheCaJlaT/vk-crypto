const fetch = require('node-fetch')

class Crypto {

    constructor(token) {
        // check token
        if (!token) throw new Error(`"token" is missed`)
        this.token = token
    };

    async getGameToken(platform = 'web') {
        if (!this.gametoken) {
            const res = await fetch(`https://api.vk.com/method/apps.get?access_token=${this.token}&v=5.131&app_id=7932067&platform=${platform}`).then(res => res.json());
            const profid = await fetch(`https://api.vk.com/method/account.getProfileInfo?access_token=${this.token}&v=5.131`).then(res => res.json()).then( response => response.response.id);
            this.id = profid;
            const weburl = res?.response?.items?.[0].webview_url;
            if (!weburl) throw new Error("cannot get gametoken(vk params)");
            this.gametoken = weburl.match(/^.*index\.html\?(.+)$/)[1];
        }
        return this.gametoken
    }

    async call(method = "", id = '#useid', params = {}) {
        const at = await this.getGameToken()
        Object.assign(params, {id: id === '#useid' ? this.id : id, params: at})
        return await fetch(`https://baguette-game.com:1000/${method}`, {
            body: JSON.stringify(params),
            method: "POST",
            headers: {
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            } 
        }).then(res => res.status === 200 ? res.json() : res.text())
    }
    async stats() {
        return await this.call()
    };

    async balance(id) {
        let res = await this.call('GetUserBalance', id)
        return res
    }

    async buy(name) {
        if (!name) throw new Error('Вы не указали название крипты')
        return await this.call(`BuyUpgrade${name}`)
    }

    async getCosts() {
        let costs = [
            { name: 'Bitcoin', stat_name: 'bitcoin', boost: 1, price: 100 },
            { name: 'Ethereum', stat_name: 'ethereum', boost: 5, price: 150 },
            { name: 'Cardano', stat_name: 'cardano', boost: 10, price: 225 },
            { name: 'BinanceCoin', stat_name: 'binanceCoin', boost: 15, price: 340 },
            { name: 'Tether', stat_name: 'tether', boost: 20, price: 500 },
            { name: 'XRP', stat_name: 'xrp', boost: 30, price: 760 },
            { name: 'Dogecoin', stat_name: 'dogecoin', boost: 40, price: 1140 },
            { name: 'Polkadot', stat_name: 'polkadot', boost: 50, price: 1710 },
            { name: 'USD', stat_name: 'usdCoin', boost: 60, price: 2560 },
            { name: 'Solana', stat_name: 'solana', boost: 80, price: 4000 }
        ]
        let payback = []
        let stat = await this.call()
        for (let i = 0; i < costs.length; i++) {
            costs[i].price = costs[i].price * Math.pow(2, stat[costs[i].stat_name])
            payback[i] = costs[i].price / (stat.in_minute_mining + costs[i].boost)
        }
        let min_payback = Math.min.apply(null, payback)
        return { costs: costs, balance: stat.balance, profit: stat.in_minute_mining, recommended: costs[payback.indexOf(min_payback)] }
    }

    async getTop() {
        let res = await this.call('GetTop100Users')
        if (res == 'Too many requests, please try again later') return false
        let users = []
        for (let i = 0; i < res.users[0].length; i++) {
            users[i] = res.users[0][i]
            users[i].balance = res.balance[i]
        }
        return users
    }

    async double(amount, type = 'double') {
        if (!amount) throw new Error('Вы не указали ставку')
        return await this.call(type, this.id, { "amount": amount })
    }

    async transfer(amount, recipient) {
        if (!amount) throw new Error('Вы не указали сумму перевода')
        if (!recipient) throw new Error('Вы не указали получателя')
        return await this.call('Transfer', this.id, {
            "amount": amount, 
            "recipient_id": recipient
        })
    }
}
module.exports = Crypto;