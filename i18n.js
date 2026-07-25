// ========== 多语言翻译 ==========
const I18N = {
    zh: {
        connectWallet: '连接钱包',
        home: '首页', presale: '预售', queue: '排队', mine: '矿机', assets: '我的',
        currentPrice: '当前价格', dailyIncrease: '每日涨幅', soldTotal: '已售 / 总量',
        exitProgress: '出局进度', goPresale: '去预售', goMine: '去矿机', goQueue: '去排队',
        priceTrend: '官方价走势', remaining: '剩余可售', presaleDesc: '用USDT直接购买NNB，售完即止',
        investAmount: '投入金额', expected: '预计获得', releaseBase: '矿机释放基数 (3x)',
        dailyEstimate: '每日释放预估', buyMiner: '购买矿机', presaleStatus: '预售状态',
        inProgress: '进行中', queueCount: '排队人数', waitReward: '等待奖励',
        queueDesc: 'NNB售完后，排队等待认购', subscribeAmount: '认购金额',
        subscribeQueue: '排队认购', myQueueOrders: '我的排队订单', noOrders: '暂无排队订单',
        mineDesc: '查看矿机状态和释放进度', myMiner: '我的矿机',
        investedUSDT: '投入USDT', obtainedNNB: '获得NNB', released: '已释放',
        pending: '待领取', claim: '领取收益', realtimeEarn: '实时收益',
        totalEarned: '累计已领收益', walletBalance: '钱包余额',
        myReferral: '我的推荐链接', myInviteCode: '我的邀请码',
        copyRefLink: '复制推荐链接', uplineCode: '上级邀请码',
        bindReferrer: '绑定推荐人', refPlaceholder: '输入推荐人钱包地址或邀请码',
        bind: '绑定', teamInfo: '团队信息', directCount: '直推人数',
        personalMiner: '个人矿机价值', teamTotal: '伞下团队业绩',
        maxGen: '享有代数', node: '节点', myNode: '我的节点',
        claimDividend: '可领分红', normalSold: '普通节点已售', superSold: '超级节点已售',
        buyNormal: '普通 500U', buySuper: '超级 1000U', claimNodeDiv: '领取节点分红',
        notBound: '未绑定', notPurchased: '未购买', active: '运行中', inactive: '未激活',
        walletConnected: '钱包已连接', connectFailed: '连接失败',
        linkCopied: '推荐链接已复制，可直接粘贴发送', pleaseConnect: '请先连接钱包',
        bindingSuccess: '推荐人绑定成功', bindingFailed: '绑定失败',
        approveUSDT: '正在授权USDT...', approveSuccess: '授权成功，正在购买...',
        buySuccess: '矿机购买成功', buyFailed: '购买失败',
        claimSuccess: '领取成功', claimFailed: '领取失败',
        queueSuccess: '排队成功，等待匹配中', queueFailed: '排队失败',
        nodeSuccess: '节点购买成功', nodeFailed: '购买失败',
        divSuccess: '分红领取成功', divFailed: '领取失败',
        minUSDT: '最低 10 USDT', enterAmount: '请输入金额',
        soldOut: '已售完', presaleActive: '进行中',
        reinvest: '复投', transfer: '划转',
        reinvestAmount: '复投金额 (NNB)',
        recvAddr: '接收地址', transferAmount: '划转金额',
        usdtBal: 'USDT余额', nnbBal: 'NNB余额', bnbBal: 'BNB余额',
        connectVisible: '连接钱包后可见',
    },
    en: {
        connectWallet: 'Connect Wallet',
        home: 'Home', presale: 'Presale', queue: 'Queue', mine: 'Mine', assets: 'Assets',
        currentPrice: 'Current Price', dailyIncrease: 'Daily Increase', soldTotal: 'Sold / Total',
        exitProgress: 'Exit Progress', goPresale: 'Presale', goMine: 'Mine', goQueue: 'Queue',
        priceTrend: 'Official Price Trend', remaining: 'Remaining', presaleDesc: 'Buy NNB with USDT, until sold out',
        investAmount: 'Invest Amount', expected: 'Expected', releaseBase: 'Release Base (3x)',
        dailyEstimate: 'Daily Release Est.', buyMiner: 'Buy Miner', presaleStatus: 'Presale Status',
        inProgress: 'Active', queueCount: 'Queue Count', waitReward: 'Wait Reward',
        queueDesc: 'Queue to buy after NNB sold out', subscribeAmount: 'Subscribe Amount',
        subscribeQueue: 'Subscribe', myQueueOrders: 'My Queue Orders', noOrders: 'No orders',
        mineDesc: 'View miner status and release progress', myMiner: 'My Miner',
        investedUSDT: 'Invested USDT', obtainedNNB: 'Obtained NNB', released: 'Released',
        pending: 'Pending', claim: 'Claim', realtimeEarn: 'Realtime Earnings',
        totalEarned: 'Total Earned', walletBalance: 'Wallet Balance',
        myReferral: 'My Referral Link', myInviteCode: 'My Invite Code',
        copyRefLink: 'Copy Referral Link', uplineCode: 'Upline Code',
        bindReferrer: 'Bind Referrer', refPlaceholder: 'Enter referrer address or code',
        bind: 'Bind', teamInfo: 'Team Info', directCount: 'Direct Referrals',
        personalMiner: 'Personal Miner Value', teamTotal: 'Team Total',
        maxGen: 'Max Generations', node: 'Node', myNode: 'My Node',
        claimDividend: 'Claimable Dividend', normalSold: 'Normal Sold', superSold: 'Super Sold',
        buyNormal: 'Normal 500U', buySuper: 'Super 1000U', claimNodeDiv: 'Claim Dividend',
        notBound: 'Not Bound', notPurchased: 'Not Purchased', active: 'Active', inactive: 'Inactive',
        walletConnected: 'Wallet Connected', connectFailed: 'Connection Failed',
        linkCopied: 'Referral link copied, ready to paste', pleaseConnect: 'Please connect wallet first',
        bindingSuccess: 'Referrer bound successfully', bindingFailed: 'Binding failed',
        approveUSDT: 'Approving USDT...', approveSuccess: 'Approved, purchasing...',
        buySuccess: 'Miner purchased!', buyFailed: 'Purchase failed',
        claimSuccess: 'Claimed!', claimFailed: 'Claim failed',
        queueSuccess: 'Queued, waiting for match', queueFailed: 'Queue failed',
        nodeSuccess: 'Node purchased!', nodeFailed: 'Purchase failed',
        divSuccess: 'Dividend claimed!', divFailed: 'Claim failed',
        minUSDT: 'Min 10 USDT', enterAmount: 'Please enter amount',
        soldOut: 'Sold Out', presaleActive: 'Active',
        reinvest: 'Reinvest', transfer: 'Transfer',
        reinvestAmount: 'Reinvest Amount (NNB)',
        recvAddr: 'Recipient', transferAmount: 'Transfer Amount',
        usdtBal: 'USDT Balance', nnbBal: 'NNB Balance', bnbBal: 'BNB Balance',
        connectVisible: 'Visible after connecting wallet',
    },
    ja: {
        connectWallet: 'ウォレット接続',
        home: 'ホーム', presale: '予約', queue: '並ぶ', mine: 'マイニング', assets: 'マイ',
        currentPrice: '現在価格', dailyIncrease: '日次上昇', soldTotal: '売上 / 総量',
        exitProgress: '終了進捗', goPresale: '予約へ', goMine: 'マイニングへ', goQueue: '並ぶへ',
        priceTrend: '公式価格推移', remaining: '残り', presaleDesc: 'USDTでNNBを購入、売切まで',
        investAmount: '投資額', expected: '獲得予定', releaseBase: '解放基準 (3x)',
        dailyEstimate: '日次解放予想', buyMiner: 'マイナー購入', presaleStatus: '予約状態',
        inProgress: '進行中', queueCount: '待機人数', waitReward: '待機報酬',
        queueDesc: 'NNB売切後、並んで購入', subscribeAmount: '申込額',
        subscribeQueue: '並んで申込', myQueueOrders: '私の注文', noOrders: '注文なし',
        mineDesc: 'マイナー状態と解放進捗', myMiner: '私のマイナー',
        investedUSDT: '投資USDT', obtainedNNB: '獲得NNB', released: '解放済み',
        pending: '受取可能', claim: '受取', realtimeEarn: 'リアルタイム収益',
        totalEarned: '累計受取収益', walletBalance: 'ウォレット残高',
        myReferral: '私の紹介リンク', myInviteCode: '招待コード',
        copyRefLink: '紹介リンクコピー', uplineCode: '上位コード',
        bindReferrer: '紹介者登録', refPlaceholder: '紹介者アドレス入力',
        bind: '登録', teamInfo: 'チーム情報', directCount: '直接紹介数',
        personalMiner: '個人マイナー価値', teamTotal: 'チーム総業績',
        maxGen: '享有世代', node: 'ノード', myNode: '私のノード',
        claimDividend: '受取可能配当', normalSold: '通常ノード販売', superSold: 'スーノード販売',
        buyNormal: '通常 500U', buySuper: 'スーパー 1000U', claimNodeDiv: '配当受取',
        notBound: '未登録', notPurchased: '未購入', active: '稼働中', inactive: '未稼働',
        walletConnected: 'ウォレット接続済み', connectFailed: '接続失敗',
        linkCopied: '紹介リンクコピー済み', pleaseConnect: 'ウォレット接続してください',
        bindingSuccess: '紹介者登録成功', bindingFailed: '登録失敗',
        approveUSDT: 'USDT認証中...', approveSuccess: '認証済み、購入中...',
        buySuccess: 'マイナー購入成功', buyFailed: '購入失敗',
        claimSuccess: '受取成功', claimFailed: '受取失敗',
        queueSuccess: '並び完了、マッチング待ち', queueFailed: '並び失敗',
        nodeSuccess: 'ノード購入成功', nodeFailed: '購入失敗',
        divSuccess: '配当受取成功', divFailed: '受取失敗',
        minUSDT: '最低 10 USDT', enterAmount: '金額を入力',
        soldOut: '売切', presaleActive: '進行中',
        reinvest: '再投資', transfer: '送金',
        reinvestAmount: '再投資額 (NNB)',
        recvAddr: '受取アドレス', transferAmount: '送金額',
        usdtBal: 'USDT残高', nnbBal: 'NNB残高', bnbBal: 'BNB残高',
        connectVisible: 'ウォレット接続後に表示',
    },
    ko: {
        connectWallet: '지갑 연결',
        home: '홈', presale: '예약', queue: '대기', mine: '마이닝', assets: '내정보',
        currentPrice: '현재 가격', dailyIncrease: '일일 상승', soldTotal: '판매 / 총량',
        exitProgress: '종료 진행', goPresale: '예약으로', goMine: '마이닝으로', goQueue: '대기로',
        priceTrend: '공식 가격 추이', remaining: '남은 수량', presaleDesc: 'USDT로 NNB 구매, 매진까지',
        investAmount: '투자 금액', expected: '예상 획득', releaseBase: '방출 기준 (3x)',
        dailyEstimate: '일일 방출 예상', buyMiner: '마이너 구매', presaleStatus: '예약 상태',
        inProgress: '진행중', queueCount: '대기 인원', waitReward: '대기 보상',
        queueDesc: 'NNB 매진 후 대기 구매', subscribeAmount: '신청 금액',
        subscribeQueue: '대기 신청', myQueueOrders: '내 주문', noOrders: '주문 없음',
        mineDesc: '마이너 상태 및 방출 진행', myMiner: '내 마이너',
        investedUSDT: '투자 USDT', obtainedNNB: '획득 NNB', released: '방출됨',
        pending: '수령 가능', claim: '수령', realtimeEarn: '실시간 수익',
        totalEarned: '누적 수령 수익', walletBalance: '지갑 잔액',
        myReferral: '내 추천 링크', myInviteCode: '초대 코드',
        copyRefLink: '추천 링크 복사', uplineCode: '상위 코드',
        bindReferrer: '추천인 등록', refPlaceholder: '추천인 주소 입력',
        bind: '등록', teamInfo: '팀 정보', directCount: '직접 추천 수',
        personalMiner: '개인 마이너 가치', teamTotal: '팀 총 실적',
        maxGen: '보유 세대', node: '노드', myNode: '내 노드',
        claimDividend: '수령 가능 배당', normalSold: '일반 노드 판매', superSold: '슈퍼 노드 판매',
        buyNormal: '일반 500U', buySuper: '슈퍼 1000U', claimNodeDiv: '배당 수령',
        notBound: '미등록', notPurchased: '미구매', active: '운영중', inactive: '미운영',
        walletConnected: '지갑 연결됨', connectFailed: '연결 실패',
        linkCopied: '추천 링크 복사됨', pleaseConnect: '지갑을 먼저 연결하세요',
        bindingSuccess: '추천인 등록 성공', bindingFailed: '등록 실패',
        approveUSDT: 'USDT 승인 중...', approveSuccess: '승인됨, 구매 중...',
        buySuccess: '마이너 구매 성공', buyFailed: '구매 실패',
        claimSuccess: '수령 성공', claimFailed: '수령 실패',
        queueSuccess: '대기 완료, 매칭 대기중', queueFailed: '대기 실패',
        nodeSuccess: '노드 구매 성공', nodeFailed: '구매 실패',
        divSuccess: '배당 수령 성공', divFailed: '수령 실패',
        minUSDT: '최소 10 USDT', enterAmount: '금액 입력',
        soldOut: '매진', presaleActive: '진행중',
        reinvest: '재투자', transfer: '이체',
        reinvestAmount: '재투자 금액 (NNB)',
        recvAddr: '수신 주소', transferAmount: '이체 금액',
        usdtBal: 'USDT 잔액', nnbBal: 'NNB 잔액', bnbBal: 'BNB 잔액',
        connectVisible: '지갑 연결 후 표시',
    },
};

let currentLang = 'zh';

function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.zh[key] || key;
}

function openLangModal() {
    const modal = document.getElementById('langModal');
    if (modal) modal.classList.add('show');
}

function closeLangModal(e) {
    if (e && e.target.id !== 'langModal') return;
    const modal = document.getElementById('langModal');
    if (modal) modal.classList.remove('show');
}

function switchLang(lang) {
    currentLang = lang;
    try { localStorage.setItem('nnb_lang', lang); } catch(e) {}
    // 更新弹窗选中状态（如果弹窗存在）
    const langOptions = document.querySelectorAll('.lang-option');
    if (langOptions && langOptions.length > 0) {
        const codes = ['zh', 'en', 'ja', 'ko'];
        langOptions.forEach((btn, idx) => {
            const check = btn.querySelector('i');
            if (check) check.style.display = codes[idx] === lang ? 'block' : 'none';
            if (codes[idx] === lang) btn.classList.add('lang-active');
            else btn.classList.remove('lang-active');
        });
    }
    const langModal = document.getElementById('langModal');
    if (langModal) langModal.classList.remove('show');
    try { applyLang(); } catch(e) { console.error('applyLang error:', e); }
}

function applyLang() {
    // 更新所有带 data-i18n 的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    // 更新带 data-i18n-ph 的 placeholder
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        el.placeholder = t(key);
    });
    // 更新连接钱包按钮
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn && !isConnected) {
        connectBtn.innerHTML = '<i class="ph ph-wallet"></i> <span>' + t('connectWallet') + '</span>';
    }
}

// 页面加载时恢复语言
window.addEventListener('load', () => {
    const saved = localStorage.getItem('nnb_lang');
    if (saved && I18N[saved]) {
        currentLang = saved;
        switchLang(saved);
    }
});
