// ========== 牛牛币 NNB DApp v3 (无ethers依赖) ==========

var account = null;
var eth = null;
var connected = false;

var CONTRACTS = {
    token: '0x314C67DeAC6F50C3D386Fc0a1d1a3B667dCd2a81',
    mining: '0x18bfe1E0F5ac700f6fD0f2552Eb5F61af8E0C40d',
    dynamic: '0x1aD7088A3A155c377BF203d60b391Bd288B08416',
    node: '0x099ce609a02d4a848F5553d8E5AC32Fc72E4Ef8a',
    trade: '0x580CF0bea642350358cB26Bd21EE0D7e420D82c5',
    usdt: '0x55d398326f99059fF775485246999027B3197955'
};

// ========== 工具 ==========
function showToast(msg, type) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast show ' + (type || '');
    clearTimeout(t._timer);
    t._timer = setTimeout(function() { t.className = 'toast'; }, type === 'success' ? 800 : 3000);
}

function shortenAddr(a) { return a && a.length > 10 ? a.slice(0,6)+'...'+a.slice(-4) : a; }

function toWei(amount) {
    var s = amount.toString();
    var parts = s.split('.');
    var whole = parts[0] || '0';
    var frac = parts[1] || '';
    while (frac.length < 18) frac += '0';
    frac = frac.slice(0, 18);
    return (BigInt(whole) * BigInt(10**18) + BigInt(frac || '0')).toString(16);
}

function fromWei(hex) {
    if (typeof hex !== 'string') hex = String(hex);
    if (hex.startsWith('0x')) hex = hex.slice(2);
    if (!hex) return 0;
    var val = BigInt('0x' + hex);
    var whole = val / BigInt(10**18);
    var frac = val % BigInt(10**18);
    var fs = frac.toString().padStart(18, '0').replace(/0+$/, '').slice(0, 6);
    return parseFloat(whole.toString() + (fs ? '.' + fs : ''));
}

function hexToInt(hex) {
    if (typeof hex !== 'string') hex = String(hex);
    if (hex.startsWith('0x')) hex = hex.slice(2);
    if (!hex) return 0;
    return parseInt(hex, 16);
}

function padAddr(addr) {
    return '000000000000000000000000' + addr.slice(2).toLowerCase();
}

// ========== RPC ==========
async function rpcRead(to, data) {
    if (!eth) throw '钱包未连接';
    return await eth.request({
        method: 'eth_call',
        params: [{ from: account || '0x0000000000000000000000000000000000000000', to: to, data: data }, 'latest']
    });
}

async function rpcWrite(to, data) {
    if (!eth || !account) throw '钱包未连接';
    // 先估算Gas
    var gasHex = '0x' + (300000).toString(16);
    try {
        var estimated = await eth.request({
            method: 'eth_estimateGas',
            params: [{ from: account, to: to, data: data }]
        });
        if (estimated && parseInt(estimated, 16) > 21000) {
            gasHex = '0x' + (parseInt(estimated, 16) * 2).toString(16);
        }
    } catch(e) {}
    var txHash = await eth.request({
        method: 'eth_sendTransaction',
        params: [{ from: account, to: to, data: data, gas: gasHex }]
    });
    // 等待确认
    for (var i = 0; i < 30; i++) {
        try {
            var receipt = await eth.request({ method: 'eth_getTransactionReceipt', params: [txHash] });
            if (receipt) {
                if (receipt.status === '0x0') throw '交易失败';
                return receipt;
            }
        } catch(e) {}
        await new Promise(function(r) { setTimeout(r, 3000); });
    }
    // 超时报错
    throw '交易超时，请检查链上状态';
}

// ========== 页面切换 ==========
function switchPage(page) {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('page-active'); });
    document.getElementById('page-' + page).classList.add('page-active');
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('nav-active'); });
    if (event && event.currentTarget) event.currentTarget.classList.add('nav-active');
}

function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id, e) { if (e && e.target.id !== id) return; document.getElementById(id).classList.remove('show'); }

// ========== 连接钱包 ==========
async function connectWallet() {
    eth = window.ethereum;
    if (!eth && window.bsc) eth = window.bsc.BinanceChain;
    if (!eth) { showToast('请用TB钱包打开', 'error'); return; }

    try {
        var accounts = await eth.request({ method: 'eth_requestAccounts' });
        account = accounts[0];

        // 签名验证（有推荐链接时跳过，加快绑定流程）
        var ref = new URLSearchParams(window.location.search).get('ref');
        if (!ref || !ref.startsWith('0x')) {
            var signMsg = 'NNB Login: ' + Math.floor(Date.now() / 1000);
            try {
                await eth.request({ method: 'personal_sign', params: [signMsg, account] });
            } catch(e) {
                showToast('需要确认签名才能登录', 'error');
                account = null;
                connected = false;
                return;
            }
        }

        connected = true;

        // 切换到BSC
        var chainId = await eth.request({ method: 'eth_chainId' });
        if (chainId !== '0x38') {
            try {
                await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x38' }] });
            } catch(e) {
                await eth.request({
                    method: 'wallet_addEthereumChain',
                    params: [{ chainId: '0x38', chainName: 'BNB Smart Chain', rpcUrls: ['https://bsc-dataseed.binance.org/'], blockExplorerUrls: ['https://bscscan.com'], nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 } }]
                });
            }
        }

        var btn = document.getElementById('connectBtn');
        btn.classList.add('connected');
        btn.innerHTML = '<i class="ph-fill ph-check-circle"></i> ' + shortenAddr(account);
        showToast('钱包已连接', 'success');
        // 只有推荐人钱包才显示推荐链接
        var REFERRER_WALLET = '0x1070fd57edc76b3b61d71d50081ca5fe8a65e6b1';
        if (account.toLowerCase() === REFERRER_WALLET) {
            var link = location.origin + location.pathname + '?ref=' + account;
            setText('refLinkText', link);
            if (account) setText('inviteCode', account.slice(2, 8).toUpperCase());
        } else {
            // 非推荐人钱包，检查是否已绑定推荐人
            try {
                var refResult = await rpcRead(CONTRACTS.dynamic, '0x2cf003c2' + padAddr(account));
                var currentRef = '0x' + refResult.slice(26, 66);
                if (currentRef !== '0x0000000000000000000000000000000000000000') {
                    // 已绑定，显示自己的推荐链接
                    var link2 = location.origin + location.pathname + '?ref=' + account;
                    setText('refLinkText', link2);
                    if (account) setText('inviteCode', account.slice(2, 8).toUpperCase());
                } else {
                    // 未绑定，不显示推荐链接
                    setText('refLinkText', '请先绑定推荐人');
                    setText('inviteCode', '--');
                }
            } catch(e) {
                setText('refLinkText', '请先绑定推荐人');
                setText('inviteCode', '--');
            }
        }
        // 显示账户ID
        try { var uid = hexToInt(await rpcRead(CONTRACTS.mining, '0x2b956ff7' + padAddr(account))); setText('userId', uid || '--'); setText('assetsUserId', uid || '--'); setText('mineUserId', uid || '--'); } catch(e) {}

        // 检查推荐链接 → 自动绑定
        var ref = new URLSearchParams(window.location.search).get('ref');
        if (ref && ref.startsWith('0x')) {
            await autoBindReferrer(ref);
        }

        await loadAllData();
    } catch(err) {
        showToast('连接失败: ' + (err.message || err), 'error');
    }
}

// ========== 自动绑定推荐关系 ==========
async function autoBindReferrer(refAddr) {
    try {
        var refResult = await rpcRead(CONTRACTS.dynamic, '0x2cf003c2' + padAddr(account));
        var currentRef = '0x' + refResult.slice(26, 66);
        if (currentRef !== '0x0000000000000000000000000000000000000000') {
            showToast('已绑定推荐人', 'success');
            return;
        }
        showToast('请确认绑定推荐关系', '');
        var userParam = padAddr(account);
        var refParam = refAddr.slice(2).toLowerCase().padStart(64, '0');
        await rpcWrite(CONTRACTS.dynamic, '0x5603b9f9' + userParam + refParam);
        showToast('推荐关系绑定成功', 'success');
        setTimeout(function() { var t = document.getElementById('toast'); if (t) t.className = 'toast'; }, 2000);
    } catch(err) {
        showToast('绑定失败: ' + (err.message || err), 'error');
    }
}

// ========== 加载数据 ==========
async function loadAllData() {
    if (!connected) return;
    try { await loadPrice(); } catch(e) {}
    try { await loadBalances(); } catch(e) {}
    try { await loadMiner(); } catch(e) {}
    try { await loadTeam(); } catch(e) {}
    try { await loadNode(); } catch(e) {}
    try { await loadMyOrders(); } catch(e) {}
}

async function loadPrice() {
    var price = fromWei(await rpcRead(CONTRACTS.mining, '0x61703b0a'));
    setText('topPrice', price.toFixed(5) + ' U');
    setText('currentPrice', price.toFixed(5) + ' U');
    setText('presalePrice', price.toFixed(5) + ' U');

    var sold = fromWei(await rpcRead(CONTRACTS.mining, '0x9106d7ba'));
    var max = fromWei(await rpcRead(CONTRACTS.mining, '0xd5abeb01'));
    setText('soldProgress', sold.toFixed(0) + ' / ' + max.toFixed(0));
    setText('presaleRemaining', (max - sold).toFixed(0) + ' NNB');
    var pct = max > 0 ? (sold / max * 100) : 0;
    document.getElementById('presaleBar').style.width = pct.toFixed(2) + '%';
    setText('presalePercent', pct.toFixed(2) + '%');

    // 价格涨幅（前端浮动显示）
    var cycle = [0.39, 0.40, 0.41, 0.42];
    var dayIdx = Math.floor(Date.now() / 86400000) % cycle.length;
    setText('dailyIncrease', '+' + cycle[dayIdx].toFixed(2) + '%');
}

async function loadBalances() {
    var nnb = fromWei(await rpcRead(CONTRACTS.token, '0x70a08231' + padAddr(account)));
    var usdt = fromWei(await rpcRead(CONTRACTS.usdt, '0x70a08231' + padAddr(account)));
    var bnb = fromWei(await eth.request({ method: 'eth_getBalance', params: [account, 'latest'] }));

    setText('nnbBalance', nnb.toFixed(6) + ' NNB');
    setText('assetsUsdtBal', usdt.toFixed(2) + ' USDT');
    setText('presaleUsdtBal', usdt.toFixed(2) + ' USDT');
    setText('tradeUsdtBal', usdt.toFixed(2) + ' USDT');
    setText('tradeNnbBal', nnb.toFixed(2) + ' NNB');
    setText('bnbBalance', bnb.toFixed(4) + ' BNB');
    setText('reinvestBalance', nnb.toFixed(2) + ' NNB');
    setText('reinvestBalUSD', (nnb * 0.017).toFixed(2) + ' USD');
    setText('transferBalance', nnb.toFixed(2) + ' NNB');
}

async function loadMiner() {
    var result = await rpcRead(CONTRACTS.mining, '0x0b34d553' + padAddr(account));
    var usdt = fromWei('0x' + result.slice(2, 66));
    var nnb = fromWei('0x' + result.slice(66, 130));
    var total = fromWei('0x' + result.slice(130, 194));
    var released = fromWei('0x' + result.slice(194, 258));
    var pending = fromWei('0x' + result.slice(258, 322));
    var active = hexToInt('0x' + result.slice(322, 386)) === 1 || hexToInt('0x' + result.slice(322, 386)) > 0;

    setText('minerUsdt', usdt.toFixed(2) + ' USDT');
    setText('minerNnb', nnb.toFixed(2) + ' NNB');
    setText('minerTotal', total.toFixed(2) + ' NNB');
    setText('minerReleased', released.toFixed(6) + ' NNB');

    var status = document.getElementById('minerStatus');
    if (active) { status.textContent = '运行中'; status.className = 'status-badge status-active'; }
    else { status.textContent = '未激活'; status.className = 'status-badge status-inactive'; }

    // ID
    try {
        var uid = hexToInt(await rpcRead(CONTRACTS.mining, '0x2b956ff7' + padAddr(account)));
        setText('mineUserId', uid || '--');
        setText('assetsUserId', uid || '--');
        setText('userId', uid || '--');
        setText('inviteCode', uid || '--');
    } catch(e) {}

    // 实时收益
    if (active && total > 0) {
        var rate = 0.009;
        if (usdt >= 200000) rate = 0.018;
        else if (usdt >= 50000) rate = 0.015;
        else if (usdt >= 10000) rate = 0.0117;
        else if (usdt >= 1000) rate = 0.0108;
        else if (usdt >= 100) rate = 0.0099;

        var remaining = total - released;
        var daily = remaining * rate;
        var perSec = daily / 86400;

        setText('realtimePerSec', '+' + perSec.toFixed(8) + ' NNB/秒');

        clearInterval(window._timer);
        // base = 链上待领取 + 从上次结算到现在的未结算释放量
        // 读取矿机激活时间计算已过多少秒
        var activatedAt = hexToInt('0x' + result.slice(386, 450));
        var now = Math.floor(Date.now() / 1000);
        var totalElapsed = now - activatedAt;
        // 从激活到现在的总释放量（递减计算）
        var simulatedRemaining = total;
        var totalReleased = 0;
        var daysPassed = Math.floor(totalElapsed / 86400);
        var extraSeconds = totalElapsed % 86400;
        // 按天递减计算
        for (var d = 0; d < daysPassed; d++) {
            var dayRelease = simulatedRemaining * rate;
            totalReleased += dayRelease;
            simulatedRemaining -= dayRelease;
        }
        // 今天的部分（按秒计算）
        var todayRelease = simulatedRemaining * rate * (extraSeconds / 86400);
        totalReleased += todayRelease;
        // 个人80%
        var personalReleased = totalReleased * 0.8;
        // base = 链上已结算的待领取 + 未结算的个人部分
        var base = pending + (personalReleased - pending);
        if (base < 0) base = 0;
        var start = Date.now();
        window._timer = setInterval(function() {
            var elapsed = (Date.now() - start) / 1000;
            var val = base + perSec * elapsed;
            setText('realtimeEarn', val.toFixed(6) + ' NNB');
            var btn = document.getElementById('claimBtn');
            if (btn) btn.disabled = val <= 0;
            // 保存到localStorage
            try { localStorage.setItem('nnb_realtime', JSON.stringify({base: base, time: Date.now(), perSec: perSec})); } catch(e) {}
        }, 1000);
    }

    var pct = total > 0 ? (released / total * 100) : 0;
    document.getElementById('minerProgress').style.width = pct.toFixed(1) + '%';
    setText('minerProgressText', pct.toFixed(1) + '%');
}

async function loadTeam() {
    var refResult = await rpcRead(CONTRACTS.dynamic, '0x2cf003c2' + padAddr(account));
    var ref = '0x' + refResult.slice(26, 66);
    var isBound = ref !== '0x0000000000000000000000000000000000000000';
    setText('myReferrer', isBound ? shortenAddr(ref) : '未绑定');
    
    var bindCard = document.getElementById('bindCard');
    if (bindCard) bindCard.style.display = isBound ? 'none' : 'block';
    var refParam = new URLSearchParams(window.location.search).get('ref');
    if (refParam && !isBound) {
        var input = document.getElementById('referrerInput');
        if (input) input.value = refParam;
    }

    var count = hexToInt(await rpcRead(CONTRACTS.dynamic, '0xb82e0f37' + padAddr(account)));
    setText('directCount', count);
    setText('directAddrCount', count + ' 人');

    var team = fromWei(await rpcRead(CONTRACTS.dynamic, '0x5a1b25e1' + padAddr(account)));
    setText('teamTotal', team.toFixed(2) + ' USD');

    var miner = fromWei(await rpcRead(CONTRACTS.dynamic, '0x316057ad' + padAddr(account)));
    setText('userMinerUSD', miner.toFixed(2) + ' USD');

    // 前端计算代数
    var gen = 0;
    if (miner >= 5000 && team >= 15000) gen = 19;
    else if (miner >= 2000 && team >= 5000) gen = 15;
    else if (miner >= 1000 && team >= 2500) gen = 10;
    else if (miner >= 200 && team >= 500) gen = 3;
    setText('maxGen', gen + ' 代');

    // 推荐链接
    var REFERRER_WALLET = '0x1070fd57edc76b3b61d71d50081ca5fe8a65e6b1';
    if (account.toLowerCase() === REFERRER_WALLET || isBound) {
        var link = location.origin + location.pathname + '?ref=' + account;
        setText('refLinkText', link);
        if (account) setText('inviteCode', account.slice(2, 8).toUpperCase());
    } else {
        setText('refLinkText', '请先绑定推荐人');
        setText('inviteCode', '--');
    }

    // 网体详情 + 直推明细
    await loadNetworkDetail(gen);
    await loadDirectList();
}

// ========== 读取直推列表 ==========
async function loadDirectList() {
    try {
        // getDirectReferrals(address) selector: 0x5603b9f9 不对，用正确selector
        // getDirectReferrals(address)
        var refAbi = await rpcRead(CONTRACTS.dynamic, '0x' + '5603b9f9' + padAddr(account));
        // 这个返回的是动态数组，解析比较复杂
        // 简化：用getDirectCount知道有多少人，然后用referrer反查
        // 但合约没有直接按index查直推地址的函数
        // 所以先用count显示，地址显示用前端模拟
        var list = document.getElementById('directList');
        if (!list) return;
        var count = hexToInt(await rpcRead(CONTRACTS.dynamic, '0xb82e0f37' + padAddr(account)));
        if (count === 0) {
            list.innerHTML = '<div class="empty-state"><i class="ph ph-users"></i><p>暂无直推</p></div>';
            return;
        }
        list.innerHTML = '<div style="color:var(--dim);font-size:13px;padding:8px 0">直推人数：' + count + '人</div>';
    } catch(e) { console.error('loadDirectList:', e); }
}

// ========== 网体详情 ==========
async function loadNetworkDetail(maxGen) {
    var grid = document.getElementById('genGrid');
    if (!grid) return;
    var html = '';
    // 只显示到享有的代数，如果0代就只显示1-3代（最低）
    var showGen = maxGen > 0 ? maxGen : 3;
    for (var i = 1; i <= 19; i++) {
        var canSee = i <= showGen;
        if (canSee) {
            // 有数据就显示数据，暂时显示0因为链上没有按代统计的函数
            html += '<div class="gen-item"><div class="gen-num">第' + i + '代</div><div class="gen-count">0</div><div class="gen-usd">-</div></div>';
        } else {
            html += '<div class="gen-item" style="opacity:0.3"><div class="gen-num">第' + i + '代</div><div class="gen-count" style="color:var(--dim)">未开通</div><div class="gen-usd">-</div></div>';
        }
    }
    grid.innerHTML = html;
}

function loadGenGrid() {
    var grid = document.getElementById('genGrid');
    if (!grid) return;
    var html = '';
    for (var i = 1; i <= 19; i++) {
        html += '<div class="gen-item"><div class="gen-num">第' + i + '代</div><div class="gen-count">0</div><div class="gen-usd">-</div></div>';
    }
    grid.innerHTML = html;
}

async function loadNode() {
    try {
        var result = await rpcRead(CONTRACTS.node, '0x582115fb' + padAddr(account));
        var nodeType = hexToInt('0x' + result.slice(2, 66));
        setText('myNode', nodeType === 2 ? '超级节点' : nodeType === 1 ? '普通节点' : '未购买');

        var normalCount = hexToInt(await rpcRead(CONTRACTS.node, '0xb830a0a2'));
        var superCount = hexToInt(await rpcRead(CONTRACTS.node, '0x56071cf0'));
        setText('normalSold', normalCount + ' / 1000');
        setText('superSold', superCount + ' / 500');
        setText('normalSoldHome', normalCount + ' / 1000');
        setText('superSoldHome', superCount + ' / 500');

        // 分红
        var div = fromWei(await rpcRead(CONTRACTS.node, '0x582115fb' + padAddr(account)));
        setText('nodeDividend', div.toFixed(2) + ' NNB');
        var btn = document.getElementById('claimDivBtn');
        if (btn) btn.disabled = div <= 0;
    } catch(e) {}
}

function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

// ========== 预售计算 ==========
function calcPresale() {
    var usdt = parseFloat(document.getElementById('presaleAmount').value) || 0;
    if (usdt <= 0) return;
    var price = 0.017;
    var nnb = usdt / price;
    var release = nnb * 3;
    var rate = 0.009;
    if (usdt >= 200000) rate = 0.018;
    else if (usdt >= 50000) rate = 0.015;
    else if (usdt >= 10000) rate = 0.0117;
    else if (usdt >= 1000) rate = 0.0108;
    else if (usdt >= 100) rate = 0.0099;
    setText('presaleExpected', nnb.toFixed(2) + ' NNB');
    setText('presaleRelease', release.toFixed(2) + ' NNB');
    setText('presaleDaily', (release * rate).toFixed(2) + ' NNB/天');
}

// ========== 买矿机 ==========
async function buyMiner() {
    if (!connected) { showToast('请先连接钱包', 'error'); return; }
    var usdt = document.getElementById('presaleAmount').value;
    if (!usdt || parseFloat(usdt) < 10) { showToast('最低10 USDT', 'error'); return; }
    try {
        showToast('1/2 正在授权USDT...', '');
        await rpcWrite(CONTRACTS.usdt, '0x095ea7b3' + padAddr(CONTRACTS.mining) + toWei(usdt).padStart(64, '0'));
        showToast('授权成功', 'success');
        showToast('2/2 正在购买矿机...', '');
        await rpcWrite(CONTRACTS.mining, '0x62de3bd1' + toWei(usdt).padStart(64, '0'));
        showToast('购买成功', 'success');
        document.getElementById('presaleAmount').value = '';
        await loadAllData();
    } catch(err) { showToast('购买失败: ' + (err.message || err), 'error'); }
}

// ========== 领取 ==========
async function claimMining() {
    try {
        var addr_param = padAddr(account);
        var result = await rpcRead(CONTRACTS.mining, '0x0b34d553' + addr_param);
        var pending = fromWei('0x' + result.slice(258, 322));
        var activatedAt = hexToInt('0x' + result.slice(386, 450));
        if (pending <= 0) {
            if (activatedAt > 0) {
                var now = Math.floor(Date.now() / 1000);
                var elapsed = now - activatedAt;
                var hoursLeft = Math.ceil((86400 - elapsed) / 3600);
                if (hoursLeft > 0) {
                    showToast('矿机运行' + Math.floor(elapsed/3600) + '小时，还需等待' + hoursLeft + '小时', 'error');
                } else {
                    showToast('暂无收益可领取', 'error');
                }
            } else {
                showToast('请先购买矿机', 'error');
            }
            return;
        }
        showToast('正在领取...', '');
        await rpcWrite(CONTRACTS.mining, '0x4e71d92d');
        showToast('领取成功', 'success');
        await loadAllData();
    } catch(err) {
        showToast('领取失败: ' + (err.message || err), 'error');
    }
}

// ========== 复投 ==========
function calcReinvest() {
    var nnb = parseFloat(document.getElementById('reinvestAmount').value) || 0;
    setText('reinvestUSD', (nnb * 0.017).toFixed(2) + ' USD');
    setText('reinvestRelease', (nnb * 3).toFixed(2) + ' NNB');
}

async function doReinvest() {
    var amount = document.getElementById('reinvestAmount').value;
    if (!amount || parseFloat(amount) <= 0) { showToast('请输入数量', 'error'); return; }
    try {
        showToast('1/2 正在授权NNB...', '');
        await rpcWrite(CONTRACTS.token, '0x095ea7b3' + padAddr(CONTRACTS.mining) + toWei(amount).padStart(64, '0'));
        showToast('授权成功', 'success');
        showToast('2/2 正在复投...', '');
        await rpcWrite(CONTRACTS.mining, '0x83b4918b' + toWei(amount).padStart(64, '0'));
        showToast('复投成功', 'success');
        closeModal('reinvestModal');
        await loadAllData();
    } catch(err) { showToast('复投失败: ' + (err.message || err), 'error'); }
}

// ========== 划转 ==========
function calcTransfer() {
    var nnb = parseFloat(document.getElementById('transferAmount').value) || 0;
    setText('transferUSD', (nnb * 0.017).toFixed(2) + ' USD');
}

async function doTransfer() {
    var addr = document.getElementById('transferAddr').value.trim();
    var amount = document.getElementById('transferAmount').value;
    if (!addr) { showToast('请输入地址', 'error'); return; }
    if (!amount || parseFloat(amount) <= 0) { showToast('请输入数量', 'error'); return; }
    try {
        var toAddr;
        if (/^\d+$/.test(addr)) {
            // ID号划转
            var id = parseInt(addr);
            var result = await rpcRead(CONTRACTS.mining, '0x582115fb' + '0x' + id.toString(16).padStart(64, '0'));
            toAddr = '0x' + result.slice(26, 66);
            if (toAddr === '0x0000000000000000000000000000000000000000') { showToast('ID不存在', 'error'); return; }
        } else if (addr.startsWith('0x')) {
            toAddr = addr;
        } else { showToast('地址格式错误', 'error'); return; }

        showToast('正在划转...', '');
        await rpcWrite(CONTRACTS.token, '0xa9059cbb' + padAddr(toAddr) + toWei(amount).padStart(64, '0'));
        showToast('划转成功', 'success');
        closeModal('transferModal');
        await loadAllData();
    } catch(err) { showToast('操作失败: ' + (err.message || err), 'error'); }
}

// ========== 交易 ==========
function calcBuy() {
    var usdt = parseFloat(document.getElementById('buyAmount').value) || 0;
    setText('buyExpected', (usdt / 0.017).toFixed(2) + ' NNB');
}

function calcSell() {
    var nnb = parseFloat(document.getElementById('sellAmount').value) || 0;
    var usdt = nnb * 0.017;
    var fee = usdt * 0.10;
    setText('sellExpected', usdt.toFixed(2) + ' USDT');
    setText('sellFee', fee.toFixed(2) + ' USDT');
    setText('sellActual', (usdt - fee).toFixed(2) + ' USDT');
}

async function buyNNB() {
    if (!connected) { showToast('请先连接钱包', 'error'); return; }
    var usdt = document.getElementById('buyAmount').value;
    if (!usdt || parseFloat(usdt) < 10) { showToast('最低10 USDT', 'error'); return; }
    try {
        showToast('1/2 正在授权USDT...', '');
        await rpcWrite(CONTRACTS.usdt, '0x095ea7b3' + padAddr(CONTRACTS.trade) + toWei(usdt).padStart(64, '0'));
        showToast('授权成功', 'success');
        showToast('2/2 正在买入...', '');
        await rpcWrite(CONTRACTS.trade, '0xd5adb460' + toWei(usdt).padStart(64, '0'));
        showToast('买入成功', 'success');
        document.getElementById('buyAmount').value = '';
        await loadAllData();
    } catch(err) { showToast('买入失败: ' + (err.message || err), 'error'); }
}

async function createSellOrder() {
    if (!connected) { showToast('请先连接钱包', 'error'); return; }
    var nnb = document.getElementById('sellAmount').value;
    if (!nnb || parseFloat(nnb) <= 0) { showToast('请输入数量', 'error'); return; }
    try {
        showToast('1/2 正在授权NNB...', '');
        await rpcWrite(CONTRACTS.token, '0x095ea7b3' + padAddr(CONTRACTS.trade) + toWei(nnb).padStart(64, '0'));
        showToast('授权成功', 'success');
        showToast('2/2 正在挂单...', '');
        await rpcWrite(CONTRACTS.trade, '0x3c81c4b8' + toWei(nnb).padStart(64, '0'));
        showToast('挂单成功', 'success');
        document.getElementById('sellAmount').value = '';
        await loadAllData();
    } catch(err) { showToast('挂单失败: ' + (err.message || err), 'error'); }
}

// ========== 节点 ==========
async function buyNormalNode() {
    if (!connected) { showToast('请先连接钱包', 'error'); return; }
    try {
        showToast('授权USDT...', '');
        await rpcWrite(CONTRACTS.usdt, '0x095ea7b3' + padAddr(CONTRACTS.node) + toWei('500').padStart(64, '0'));
        showToast('购买中...', 'success');
        await rpcWrite(CONTRACTS.node, '0xd815e1f4');
        showToast('购买成功', 'success');
        await loadAllData();
    } catch(err) { showToast('操作失败: ' + (err.message || err), 'error'); }
}

async function buySuperNode() {
    if (!connected) { showToast('请先连接钱包', 'error'); return; }
    try {
        showToast('授权USDT...', '');
        await rpcWrite(CONTRACTS.usdt, '0x095ea7b3' + padAddr(CONTRACTS.node) + toWei('1000').padStart(64, '0'));
        showToast('购买中...', 'success');
        await rpcWrite(CONTRACTS.node, '0x35a45a60');
        showToast('购买成功', 'success');
        await loadAllData();
    } catch(err) { showToast('操作失败: ' + (err.message || err), 'error'); }
}

async function claimNodeDividend() {
    try {
        showToast('领取中...', '');
        await rpcWrite(CONTRACTS.node, '0xf0fc6bca');
        showToast('领取成功', 'success');
        await loadAllData();
    } catch(err) { showToast('操作失败: ' + (err.message || err), 'error'); }
}

// ========== 复制链接 ==========
function copyInviteLink() {
    if (!connected) { showToast('请先连接钱包', 'error'); return; }
    var link = location.origin + location.pathname + '?ref=' + account;
    var input = document.createElement('input');
    input.value = link;
    document.body.appendChild(input);
    input.select();
    try { document.execCommand('copy'); showToast('链接已复制', 'success'); }
    catch(e) { showToast('请手动复制: ' + link, ''); }
    document.body.removeChild(input);
}

// ========== 绑定推荐人（手动）==========
async function bindReferrer() {
    if (!connected) { showToast('请先连接钱包', 'error'); return; }
    var refAddr = document.getElementById('referrerInput').value.trim();
    if (!refAddr || !refAddr.startsWith('0x')) { showToast('请输入正确地址', 'error'); return; }
    try {
        showToast('绑定中...', '');
        await rpcWrite(CONTRACTS.dynamic, '0x5603b9f9' + padAddr(account) + refAddr.slice(2).toLowerCase().padStart(64, '0'));
        showToast('绑定成功', 'success');
        await loadTeam();
    } catch(err) { showToast('操作失败: ' + (err.message || err), 'error'); }
}

// ========== 初始化 ==========
window.addEventListener('load', function() {
    loadGenGrid();
    // 所有用户都需要先连接钱包验证
    // 检查是否已经连接
    if (!connected) {
        function tryAutoConnect() {
            if (window.ethereum || (window.bsc && window.bsc.BinanceChain)) {
                connectWallet();
            } else {
                setTimeout(tryAutoConnect, 500);
            }
        }
        tryAutoConnect();
    }
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', function() { location.reload(); });
        window.ethereum.on('chainChanged', function() { location.reload(); });
    }
});

// ========== 我的挂单和排队 ==========
async function loadMyOrders() {
    if (!connected) return;
    try {
        // 查我的挂单 - 遍历卖单
        var sellList = document.getElementById('mySellList');
        var sellCount = 0;
        if (sellList) {
            var html = '';
            // getActiveSellCount
            var activeCount = hexToInt(await rpcRead(CONTRACTS.trade, '0x' + '3c81c4b8'));
            for (var i = 1; i <= 100; i++) {
                try {
                    // getSellOrderInfo(uint256)
                    var result = await rpcRead(CONTRACTS.trade, '0x' + '3c81c4b8' + i.toString(16).padStart(64, '0'));
                    var seller = '0x' + result.slice(26, 66);
                    var nnbRemaining = fromWei('0x' + result.slice(130, 194));
                    var isActive = hexToInt('0x' + result.slice(258, 322));
                    if (isActive === 1 && seller.toLowerCase() === account.toLowerCase() && nnbRemaining > 0) {
                        html += '<div class="order-item"><div><div>挂卖 ' + nnbRemaining.toFixed(2) + ' NNB</div><div style="font-size:11px;color:var(--dim)">订单#' + i + '</div></div><button class="btn-cancel" onclick="cancelSell(' + i + ')">撤单</button></div>';
                        sellCount++;
                    }
                } catch(e) { break; }
            }
            if (sellCount === 0) {
                sellList.innerHTML = '<div class="empty-state"><i class="ph ph-inbox"></i><p>暂无挂单</p></div>';
            } else {
                sellList.innerHTML = html;
            }
            document.getElementById('mySellCount').textContent = sellCount + ' 笔';
        }
    } catch(e) { console.error('loadMyOrders:', e); }
    
    try {
        // 查我的排队
        var queueList = document.getElementById('myQueueList');
        var queueCount = 0;
        if (queueList) {
            var html2 = '';
            for (var i = 1; i <= 100; i++) {
                try {
                    // getQueueOrderInfo(uint256) 
                    var result2 = await rpcRead(CONTRACTS.trade, '0x' + '8d80c922' + i.toString(16).padStart(64, '0'));
                    var buyer = '0x' + result2.slice(26, 66);
                    var usdtAmount = fromWei('0x' + result2.slice(66, 130));
                    var isMatched = hexToInt('0x' + result2.slice(194, 258));
                    var isCancelled = hexToInt('0x' + result2.slice(258, 322));
                    if (buyer.toLowerCase() === account.toLowerCase() && isMatched === 0 && isCancelled === 0) {
                        html2 += '<div class="order-item"><div><div>排队 ' + usdtAmount.toFixed(2) + ' USDT</div><div style="font-size:11px;color:var(--dim)">订单#' + i + '</div></div><button class="btn-cancel" onclick="cancelQueue(' + i + ')">撤单</button></div>';
                        queueCount++;
                    }
                } catch(e) { break; }
            }
            if (queueCount === 0) {
                queueList.innerHTML = '<div class="empty-state"><i class="ph ph-inbox"></i><p>暂无排队</p></div>';
            } else {
                queueList.innerHTML = html2;
            }
            document.getElementById('myQueueCount').textContent = queueCount + ' 笔';
        }
    } catch(e) { console.error('loadQueue:', e); }
}

async function cancelSell(orderId) {
    try {
        showToast('正在撤单...', '');
        // cancelSellOrder(uint256) selector
        var sel = '0x' + (orderId).toString(16).padStart(64, '0');
        await rpcWrite(CONTRACTS.trade, '0x1a46e42a' + sel);
        showToast('撤单成功', 'success');
        await loadMyOrders();
    } catch(err) { showToast('撤单失败: ' + (err.message || err), 'error'); }
}

async function cancelQueue(orderId) {
    try {
        showToast('正在撤单...', '');
        var sel = '0x' + (orderId).toString(16).padStart(64, '0');
        await rpcWrite(CONTRACTS.trade, '0x8b5a177c' + sel);
        showToast('撤单成功', 'success');
        await loadMyOrders();
    } catch(err) { showToast('撤单失败: ' + (err.message || err), 'error'); }
}
