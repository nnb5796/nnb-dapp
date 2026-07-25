// ========== 牛牛币 NNB DApp 交互逻辑 v3 (无ethers依赖) ==========

let account = null;
let ethereum = null;
let isConnected = false;

// 合约地址
const CONTRACTS = {
    token: '0x66845B432fCcFf670849Bbaf79618cb5C22903B0',
    mining: '0x248c0DFc4Feb88F6F7b2bd36d97406f65B4Ad952',
    dynamic: '0x19C38eD9A442e188B036dF58C7638920C8EeDdC5',
    node: '0x5D3fB89AE094BdfcB5df2b67BdE49264c29f490b',
    trade: '0x3f7b92cd9340D37cC891D0352Ff1196168f4DBcb',
    usdt: '0x55d398326f99059fF775485246999027B3197955',
};

const CHAIN_ID = '0x38';

function showToast(msg, type) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast show ' + (type || '');
    clearTimeout(t._timer);
    t._timer = setTimeout(function() { t.className = 'toast'; }, type === 'success' ? 800 : 3000);
}

function shortenAddr(addr) {
    if (!addr || addr.length < 10) return addr;
    return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function toHex(num) {
    return '0x' + BigInt(num).toString(16);
}

function fromHex(hex) {
    return parseInt(hex, 16);
}

function toWei(amount) {
    var parts = amount.toString().split('.');
    var whole = parts[0] || '0';
    var frac = parts[1] || '';
    while (frac.length < 18) frac += '0';
    frac = frac.slice(0, 18);
    return (BigInt(whole) * BigInt('1000000000000000000') + BigInt(frac || '0')).toString();
}

function fromWei(weiStr) {
    var wei = BigInt(weiStr);
    var whole = wei / BigInt('1000000000000000000');
    var frac = wei % BigInt('1000000000000000000');
    var fracStr = frac.toString().padStart(18, '0');
    fracStr = fracStr.replace(/0+$/, '').slice(0, 6);
    return parseFloat(whole.toString() + '.' + fracStr);
}

// ========== 页面切换 ==========
function switchPage(page) {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('page-active'); });
    document.getElementById('page-' + page).classList.add('page-active');
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('nav-active'); });
    if (event && event.currentTarget) event.currentTarget.classList.add('nav-active');
}

// ========== 弹窗 ==========
function openModal(id) { var m = document.getElementById(id); if (m) m.classList.add('show'); }
function closeModal(id, e) { if (e && e.target.id !== id) return; var m = document.getElementById(id); if (m) m.classList.remove('show'); }

// ========== 连接钱包 ==========
async function connectWallet() {
    ethereum = window.ethereum;
    if (!ethereum) {
        if (window.bsc && window.bsc.BinanceChain) ethereum = window.bsc.BinanceChain;
    }
    if (!ethereum) {
        showToast('请用TB钱包DApp浏览器打开', 'error');
        return;
    }

    try {
        var accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        account = accounts[0];

        var chainId = await ethereum.request({ method: 'eth_chainId' });
        if (chainId !== CHAIN_ID) {
            try {
                await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_ID }] });
            } catch (e) {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{ chainId: CHAIN_ID, chainName: 'BNB Smart Chain', rpcUrls: ['https://bsc-dataseed.binance.org/'], blockExplorerUrls: ['https://bscscan.com'], nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 } }]
                });
            }
        }

        isConnected = true;
        var btn = document.getElementById('connectBtn');
        if (btn) {
            btn.classList.add('connected');
            btn.innerHTML = '<i class="ph-fill ph-check-circle"></i> ' + shortenAddr(account);
        }
        showToast('钱包已连接', 'success');
        // 500毫秒后强制隐藏
        setTimeout(function() { var t = document.getElementById('toast'); if (t) t.className = 'toast'; }, 500);
        await loadAllData();
    } catch (err) {
        showToast('连接失败: ' + (err.message || err), 'error');
    }
}

// ========== RPC调用 ==========
async function rpcCall(to, data, isWrite) {
    if (isWrite) {
        var tx = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [{ from: account, to: to, data: data }]
        });
        // 等待交易确认
        var receipt = null;
        for (var i = 0; i < 30; i++) {
            try {
                receipt = await ethereum.request({ method: 'eth_getTransactionReceipt', params: [tx] });
                if (receipt) break;
            } catch(e) {}
            await new Promise(function(r) { setTimeout(r, 2000); });
        }
        return receipt;
    } else {
        var result = await ethereum.request({
            method: 'eth_call',
            params: [{ from: account || '0x0000000000000000000000000000000000000000', to: to, data: data }, 'latest']
        });
        return result;
    }
}

// ========== 加载数据 ==========
async function loadAllData() {
    if (!isConnected) return;
    try { await loadPriceAndSupply(); } catch(e) { console.error('price', e); }
    try { await loadWalletBalance(); } catch(e) { console.error('wallet', e); }
    try { await loadMinerInfo(); } catch(e) { console.error('miner', e); }
    try { await loadTeamInfo(); } catch(e) { console.error('team', e); }
}

async function loadPriceAndSupply() {
    var priceResult = await rpcCall(CONTRACTS.mining, '0xbd94ad84'); // nnbPrice()
    var price = fromWei(priceResult);
    var el = document.getElementById('topPrice'); if (el) el.textContent = price.toFixed(5) + ' U';
    el = document.getElementById('currentPrice'); if (el) el.textContent = price.toFixed(5) + ' U';
    el = document.getElementById('presalePrice'); if (el) el.textContent = price.toFixed(5) + ' U';

    var soldResult = await rpcCall(CONTRACTS.mining, '0xe5e16551'); // totalSold()
    var sold = fromWei(soldResult);
    el = document.getElementById('soldProgress'); if (el) el.textContent = sold.toFixed(0) + ' / 21,000,000';
    el = document.getElementById('presaleRemaining'); if (el) el.textContent = (21000000 - sold).toFixed(0) + ' NNB';
}

async function loadWalletBalance() {
    // balanceOf(address)
    var addrParam = '000000000000000000000000' + account.slice(2).toLowerCase();
    var data = '0x70a08231' + addrParam;

    var nnbResult = await rpcCall(CONTRACTS.token, data);
    var nnbBal = fromWei(nnbResult);
    var el = document.getElementById('nnbBalance'); if (el) el.textContent = nnbBal.toFixed(6) + ' NNB';

    var usdtResult = await rpcCall(CONTRACTS.usdt, data);
    var usdtBal = fromWei(usdtResult);
    el = document.getElementById('usdtBalance'); if (el) el.textContent = usdtBal.toFixed(2) + ' USDT';
    el = document.getElementById('assetsUsdtBal'); if (el) el.textContent = usdtBal.toFixed(2) + ' USDT';
}

async function loadMinerInfo() {
    var addrParam = '000000000000000000000000' + account.slice(2).toLowerCase();
    var data = '0x6a1e1e37' + addrParam; // getMinerInfo(address)
    var result = await rpcCall(CONTRACTS.mining, data);

    // 解析返回值（7个uint256）
    var usdtInvested = fromWei('0x' + result.slice(2, 66));
    var nnbAmount = fromWei('0x' + result.slice(66, 130));
    var totalRelease = fromWei('0x' + result.slice(130, 194));
    var released = fromWei('0x' + result.slice(194, 258));
    var pending = fromWei('0x' + result.slice(258, 322));
    var activeHex = '0x' + result.slice(322, 386);
    var isActive = parseInt(activeHex, 16) === 1;

    var el;
    el = document.getElementById('minerUsdt'); if (el) el.textContent = usdtInvested.toFixed(2) + ' USDT';
    el = document.getElementById('minerNnb'); if (el) el.textContent = nnbAmount.toFixed(2) + ' NNB';
    el = document.getElementById('minerTotal'); if (el) el.textContent = totalRelease.toFixed(2) + ' NNB';
    el = document.getElementById('minerReleased'); if (el) el.textContent = released.toFixed(6) + ' NNB';

    var status = document.getElementById('minerStatus');
    if (status) {
        if (isActive) { status.textContent = '运行中'; status.className = 'status-badge status-active'; }
        else { status.textContent = '未激活'; status.className = 'status-badge status-inactive'; }
    }

    // 实时收益
    if (isActive && totalRelease > 0) {
        var dailyRate = 0.009;
        if (usdtInvested >= 200000) dailyRate = 0.018;
        else if (usdtInvested >= 50000) dailyRate = 0.015;
        else if (usdtInvested >= 10000) dailyRate = 0.0117;
        else if (usdtInvested >= 1000) dailyRate = 0.0108;
        else if (usdtInvested >= 100) dailyRate = 0.0099;

        var remaining = totalRelease - released;
        var dailyAmount = remaining * dailyRate;
        var perSec = dailyAmount / 86400;

        el = document.getElementById('realtimePerSec'); if (el) el.textContent = '+' + perSec.toFixed(8) + ' NNB/秒';

        // 启动实时跳动
        var basePending = pending;
        var startTime = Date.now();
        clearInterval(window._earnTimer);
        window._earnTimer = setInterval(function() {
            var elapsed = (Date.now() - startTime) / 1000;
            var realtime = basePending + perSec * elapsed;
            var e = document.getElementById('realtimeEarn'); if (e) e.textContent = realtime.toFixed(6) + ' NNB';
            e = document.getElementById('minerPending'); if (e) e.textContent = realtime.toFixed(6) + ' NNB';
            e = document.getElementById('nnbBalance'); if (e) e.textContent = (fromWei(nnbResult) + realtime).toFixed(6) + ' NNB';
        }, 1000);
    }

    var progress = totalRelease > 0 ? (released / totalRelease * 100) : 0;
    el = document.getElementById('minerProgress'); if (el) el.style.width = progress.toFixed(1) + '%';
    el = document.getElementById('minerProgressText'); if (el) el.textContent = progress.toFixed(1) + '%';
}

async function loadTeamInfo() {
    var addrParam = '000000000000000000000000' + account.slice(2).toLowerCase();

    // referrer(address)
    var refResult = await rpcCall(CONTRACTS.dynamic, '0x6914db5e' + addrParam);
    var refAddr = '0x' + refResult.slice(26, 66);
    var el = document.getElementById('myReferrer');
    if (el) el.textContent = (refAddr !== '0x0000000000000000000000000000000000000000') ? shortenAddr(refAddr) : '未绑定';

    // getDirectCount(address)
    var countResult = await rpcCall(CONTRACTS.dynamic, '0xa1b8d697' + addrParam);
    var count = parseInt(countResult, 16);
    el = document.getElementById('directCount'); if (el) el.textContent = count;

    // teamTotalUSD(address)
    var teamResult = await rpcCall(CONTRACTS.dynamic, '0x3d1a2c45' + addrParam);
    var teamUSD = fromWei(teamResult);
    el = document.getElementById('teamTotal'); if (el) el.textContent = teamUSD.toFixed(2) + ' USD';

    // userMinerUSD(address)
    var minerResult = await rpcCall(CONTRACTS.dynamic, '0xe6f1d6c5' + addrParam);
    var minerUSD = fromWei(minerResult);
    el = document.getElementById('userMinerUSD'); if (el) el.textContent = minerUSD.toFixed(2) + ' USD';

    // 前端计算代数
    var maxGen = 0;
    if (minerUSD >= 5000 && teamUSD >= 15000) maxGen = 19;
    else if (minerUSD >= 2000 && teamUSD >= 5000) maxGen = 15;
    else if (minerUSD >= 1000 && teamUSD >= 2500) maxGen = 10;
    else if (minerUSD >= 200 && teamUSD >= 500) maxGen = 3;
    el = document.getElementById('maxGen'); if (el) el.textContent = maxGen + ' 代';
}

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
    var el;
    el = document.getElementById('presaleExpected'); if (el) el.textContent = nnb.toFixed(2) + ' NNB';
    el = document.getElementById('presaleRelease'); if (el) el.textContent = release.toFixed(2) + ' NNB';
    el = document.getElementById('presaleDaily'); if (el) el.textContent = (release * rate).toFixed(2) + ' NNB/天';
}

// ========== 买矿机 ==========
async function buyMiner() {
    if (!isConnected) { showToast('请先连接钱包', 'error'); return; }
    var usdt = document.getElementById('presaleAmount').value;
    if (!usdt || parseFloat(usdt) < 10) { showToast('最低 10 USDT', 'error'); return; }

    try {
        // approve USDT
        showToast('正在授权USDT...', '');
        var addrParam = '000000000000000000000000' + CONTRACTS.mining.slice(2).toLowerCase();
        var amount = toWei(usdt);
        amount = amount.padStart(64, '0');
        await rpcCall(CONTRACTS.usdt, '0x095ea7b3' + addrParam + amount, true);

        // buyMiner
        showToast('授权成功，正在购买...', 'success');
        var usdtAmount = toWei(usdt).padStart(64, '0');
        await rpcCall(CONTRACTS.mining, '0xa4f9b60e' + usdtAmount, true);

        showToast('矿机购买成功！', 'success');
        document.getElementById('presaleAmount').value = '';
        await loadAllData();
    } catch (err) {
        showToast('失败: ' + (err.message || err), 'error');
    }
}

// ========== 领取 ==========
async function claimMining() {
    if (!isConnected) return;
    try {
        showToast('正在领取...', '');
        await rpcCall(CONTRACTS.mining, '0x4e71d92d', true);
        showToast('领取成功！', 'success');
        await loadAllData();
    } catch (err) {
        showToast('领取失败: ' + (err.message || err), 'error');
    }
}

// ========== 复投 ==========
async function doReinvest() {
    if (!isConnected) return;
    var amount = document.getElementById('reinvestAmount').value;
    if (!amount || parseFloat(amount) <= 0) { showToast('请输入数量', 'error'); return; }
    try {
        showToast('正在授权NNB...', '');
        var addrParam = '000000000000000000000000' + CONTRACTS.mining.slice(2).toLowerCase();
        var amt = toWei(amount).padStart(64, '0');
        await rpcCall(CONTRACTS.token, '0x095ea7b3' + addrParam + amt, true);
        showToast('正在复投...', 'success');
        await rpcCall(CONTRACTS.mining, '0x1c0b0617' + amt, true);
        showToast('复投成功！', 'success');
        closeModal('reinvestModal');
        await loadAllData();
    } catch (err) {
        showToast('复投失败: ' + (err.message || err), 'error');
    }
}

// ========== 划转 ==========
async function doTransfer() {
    if (!isConnected) return;
    var addr = document.getElementById('transferAddr').value.trim();
    var amount = document.getElementById('transferAmountInput').value;
    if (!addr || !addr.startsWith('0x')) { showToast('请输入正确的地址', 'error'); return; }
    if (!amount || parseFloat(amount) <= 0) { showToast('请输入数量', 'error'); return; }
    try {
        showToast('正在划转...', '');
        var addrParam = addr.slice(2).toLowerCase().padStart(64, '0');
        var amt = toWei(amount).padStart(64, '0');
        await rpcCall(CONTRACTS.token, '0xa9059cbb' + addrParam + amt, true);
        showToast('划转成功！', 'success');
        closeModal('transferModal');
        await loadAllData();
    } catch (err) {
        showToast('划转失败: ' + (err.message || err), 'error');
    }
}

// ========== 绑定推荐人 ==========
async function bindReferrer() {
    if (!isConnected) { showToast('请先连接钱包', 'error'); return; }
    var refAddr = document.getElementById('referrerInput').value.trim();
    if (!refAddr || !refAddr.startsWith('0x')) { showToast('请输入正确的地址', 'error'); return; }
    if (refAddr.toLowerCase() === account.toLowerCase()) { showToast('不能绑定自己', 'error'); return; }
    try {
        var userParam = '000000000000000000000000' + account.slice(2).toLowerCase();
        var refParam = refAddr.slice(2).toLowerCase().padStart(64, '0');
        await rpcCall(CONTRACTS.dynamic, '0x812d2acd' + userParam + refParam, true);
        showToast('推荐人绑定成功！', 'success');
        document.getElementById('referrerInput').value = '';
        await loadTeamInfo();
    } catch (err) {
        showToast('绑定失败: ' + (err.message || err), 'error');
    }
}

// ========== 复制推荐链接 ==========
function copyInviteLink() {
    if (!isConnected) { showToast('请先连接钱包', 'error'); return; }
    var link = window.location.origin + window.location.pathname + '?ref=' + account;
    var el = document.getElementById('refLinkText');
    if (el) el.textContent = link;
    var input = document.createElement('input');
    input.value = link;
    document.body.appendChild(input);
    input.select();
    try {
        document.execCommand('copy');
        showToast('链接已复制', 'success');
    } catch(e) {
        showToast('请手动复制: ' + link, '');
    }
    document.body.removeChild(input);
}

// ========== 节点购买 ==========
async function buyNormalNode() {
    if (!isConnected) { showToast('请先连接钱包', 'error'); return; }
    try {
        showToast('正在授权USDT...', '');
        var addrParam = '000000000000000000000000' + CONTRACTS.node.slice(2).toLowerCase();
        var amt = toWei('500').padStart(64, '0');
        await rpcCall(CONTRACTS.usdt, '0x095ea7b3' + addrParam + amt, true);
        showToast('正在购买...', 'success');
        await rpcCall(CONTRACTS.node, '0x3b1eb45e', true);
        showToast('普通节点购买成功！', 'success');
        await loadAllData();
    } catch (err) {
        showToast('购买失败: ' + (err.message || err), 'error');
    }
}

async function buySuperNode() {
    if (!isConnected) { showToast('请先连接钱包', 'error'); return; }
    try {
        showToast('正在授权USDT...', '');
        var addrParam = '000000000000000000000000' + CONTRACTS.node.slice(2).toLowerCase();
        var amt = toWei('1000').padStart(64, '0');
        await rpcCall(CONTRACTS.usdt, '0x095ea7b3' + addrParam + amt, true);
        showToast('正在购买...', 'success');
        await rpcCall(CONTRACTS.node, '0x83e24d04', true);
        showToast('超级节点购买成功！', 'success');
        await loadAllData();
    } catch (err) {
        showToast('购买失败: ' + (err.message || err), 'error');
    }
}

// ========== 网体详情 ==========
function loadGenGrid() {
    var grid = document.getElementById('genGrid');
    if (!grid) return;
    var html = '';
    for (var i = 1; i <= 19; i++) {
        html += '<div class="gen-item"><div class="gen-num">第' + i + '代</div><div class="gen-count">0人</div><div class="gen-usd">-</div></div>';
    }
    grid.innerHTML = html;
}

// ========== 初始化 ==========
window.addEventListener('load', function() {
    loadGenGrid();
    var params = new URLSearchParams(window.location.search);
    var ref = params.get('ref');
    if (ref) {
        var el = document.getElementById('referrerInput');
        if (el) el.value = ref;
    }
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', function() { window.location.reload(); });
        window.ethereum.on('chainChanged', function() { window.location.reload(); });
    }
});
