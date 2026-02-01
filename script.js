// サンプルパーティ募集データ
const samplePosts = [
    { id: 1, authorName: 'ProGamer123', gameTitle: 'Valorant', description: '初心者向けカジュアルマッチ。楽しくプレイしましょう！', recruitCount: 4, currentCount: 2, minSkillLevel: 1, createdAt: new Date(Date.now() - 3600000) },
    { id: 2, authorName: 'RPGLover', gameTitle: 'FF14', description: '24人レイドに一緒に行ける方募集。週末プレイ予定', recruitCount: 3, currentCount: 1, minSkillLevel: 5, createdAt: new Date(Date.now() - 7200000) },
    { id: 3, authorName: 'FPSKing', gameTitle: 'CSGO', description: 'ランクマッチ グローバルエリート帯。スクリムチーム募集中', recruitCount: 4, currentCount: 3, minSkillLevel: 8, createdAt: new Date(Date.now() - 1800000) },
    { id: 4, authorName: 'CasualGamer', gameTitle: 'Among Us', description: 'みんなで楽しくゲーム。ボイスチャット必須ではありません', recruitCount: 8, currentCount: 5, minSkillLevel: 1, createdAt: new Date(Date.now() - 5400000) },
    { id: 5, authorName: 'SpeedRunner', gameTitle: 'Apex Legends', description: 'ランクシーズン進行中。ゴールド帯以上推奨', recruitCount: 2, currentCount: 1, minSkillLevel: 5, createdAt: new Date(Date.now() - 900000) },
];

// アプリの状態管理
let appState = {
    currentUser: null,
    posts: [...samplePosts],
    myPosts: [],
    currentScreen: 'login'
};

// DOM要素
const loginScreen = document.getElementById('loginScreen');
const boardScreen = document.getElementById('boardScreen');
const loginForm = document.getElementById('loginForm');
const createPostBtn = document.getElementById('createPostBtn');
const boardBtn = document.getElementById('boardBtn');
const myPostsBtn = document.getElementById('myPostsBtn');
const profileBtn = document.getElementById('profileBtn');
const createPostModal = document.getElementById('createPostModal');
const createPostForm = document.getElementById('createPostForm');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelPostBtn = document.getElementById('cancelPostBtn');
const postsContainer = document.getElementById('postsContainer');

// イベントリスナー
loginForm.addEventListener('submit', handleLogin);
createPostBtn.addEventListener('click', openCreateModal);
closeModalBtn.addEventListener('click', closeCreateModal);
cancelPostBtn.addEventListener('click', closeCreateModal);
createPostForm.addEventListener('submit', handleCreatePost);
boardBtn.addEventListener('click', () => switchScreen('board'));
myPostsBtn.addEventListener('click', () => switchScreen('myPosts'));
profileBtn.addEventListener('click', showProfile);
document.getElementById('createPostModal').addEventListener('click', handleModalBackdropClick);

/**
 * ログイン処理
 */
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const gameGenre = document.getElementById('gameGenre').value;
    const skillLevel = parseInt(document.getElementById('skillLevel').value);

    appState.currentUser = {
        username,
        genre: gameGenre,
        skillLevel
    };

    switchScreen('board');
    displayPosts('all');
}

/**
 * 画面切り替え
 */
function switchScreen(screenName) {
    // すべての画面を非表示
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // メニューボタンをリセット
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));

    if (screenName === 'board') {
        boardScreen.classList.add('active');
        boardBtn.classList.add('active');
        displayPosts('all');
        appState.currentScreen = 'board';
    } else if (screenName === 'myPosts') {
        boardScreen.classList.add('active');
        myPostsBtn.classList.add('active');
        displayPosts('myPosts');
        appState.currentScreen = 'myPosts';
    } else if (screenName === 'login') {
        loginScreen.classList.add('active');
        appState.currentScreen = 'login';
    }
}

/**
 * 募集投稿を表示
 */
function displayPosts(type) {
    postsContainer.innerHTML = '';
    let postsToDisplay = [];

    if (type === 'all') {
        postsToDisplay = appState.posts;
    } else if (type === 'myPosts') {
        postsToDisplay = appState.myPosts;
    }

    if (postsToDisplay.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.color = '#999';
        emptyMsg.style.padding = '30px 20px';
        emptyMsg.textContent = type === 'myPosts' ? '募集を作成していません' : '募集がありません';
        postsContainer.appendChild(emptyMsg);
        return;
    }

    postsToDisplay.forEach(post => {
        const postCard = createPostCard(post);
        postsContainer.appendChild(postCard);
    });
}

/**
 * 募集カードを作成
 */
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    if (post.authorName === appState.currentUser?.username) {
        card.classList.add('own-post');
    }

    const isClosed = post.currentCount >= post.recruitCount;

    card.innerHTML = `
        <div class="post-header">
            <h3 class="post-title">${post.gameTitle}</h3>
            <div class="post-status ${isClosed ? 'closed' : ''}">${isClosed ? '満員' : '募集中'}</div>
        </div>
        <p class="post-author">投稿者: ${post.authorName}</p>
        <p class="post-description">${post.description}</p>
        <div class="post-meta">
            <div class="post-meta-item">👥 ${post.currentCount}/${post.recruitCount}</div>
            <div class="post-meta-item">⚡ レベル${post.minSkillLevel}+</div>
            <div class="post-meta-item">🕐 ${formatTime(post.createdAt)}</div>
        </div>
        <div class="post-footer">
            ${post.authorName !== appState.currentUser?.username && !isClosed ? 
                `<button class="btn btn-primary" onclick="handleJoinPost(${post.id})">参加申し込み</button>` :
                post.authorName === appState.currentUser?.username ?
                `<button class="btn btn-secondary" onclick="handleDeletePost(${post.id})">削除</button>` :
                `<button class="btn btn-secondary" disabled>満員</button>`
            }
        </div>
    `;

    return card;
}

/**
 * 募集に参加申し込み
 */
function handleJoinPost(postId) {
    const post = appState.posts.find(p => p.id === postId);
    if (!post) return;

    // スキルレベルチェック
    if (appState.currentUser.skillLevel < post.minSkillLevel) {
        showNotification('スキルレベルが足りません', true);
        return;
    }

    // 参加者数を増やす
    post.currentCount++;

    showNotification(`${post.gameTitle}への参加申し込みを送信しました！`);
    displayPosts(appState.currentScreen === 'myPosts' ? 'myPosts' : 'all');
}

/**
 * 募集を削除
 */
function handleDeletePost(postId) {
    const index = appState.myPosts.findIndex(p => p.id === postId);
    if (index !== -1) {
        appState.myPosts.splice(index, 1);
        showNotification('募集を削除しました');
        displayPosts('myPosts');
    }
}

/**
 * 募集作成モーダルを開く
 */
function openCreateModal() {
    createPostModal.classList.remove('hidden');
}

/**
 * 募集作成モーダルを閉じる
 */
function closeCreateModal() {
    createPostModal.classList.add('hidden');
    createPostForm.reset();
}

/**
 * モーダルの背景クリック時に閉じる
 */
function handleModalBackdropClick(e) {
    if (e.target === createPostModal) {
        closeCreateModal();
    }
}

/**
 * 募集投稿を作成
 */
function handleCreatePost(e) {
    e.preventDefault();

    const gameTitle = document.getElementById('gameTitle').value;
    const description = document.getElementById('postDescription').value;
    const recruitCount = parseInt(document.getElementById('recruitCount').value);
    const minSkillLevel = parseInt(document.getElementById('minSkillLevel').value);

    const newPost = {
        id: Math.max(...appState.myPosts.map(p => p.id), 0) + 1,
        authorName: appState.currentUser.username,
        gameTitle,
        description,
        recruitCount,
        currentCount: 1,
        minSkillLevel,
        createdAt: new Date()
    };

    appState.myPosts.push(newPost);
    appState.posts.unshift(newPost); // 最新の投稿を先頭に追加

    closeCreateModal();
    showNotification(`「${gameTitle}」の募集を作成しました！`);

    // 掲示板画面に切り替え
    switchScreen('board');
}

/**
 * 通知を表示
 */
function showNotification(message, isError = false) {
    const notification = document.getElementById('boardNotification');
    const notificationText = document.getElementById('boardNotificationText');

    notificationText.textContent = message;
    notification.classList.remove('hidden');
    if (isError) {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

/**
 * 時間をフォーマット
 */
function formatTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;

    return date.toLocaleDateString('ja-JP');
}

/**
 * プロフィール表示
 */
function showProfile() {
    if (!appState.currentUser) return;
    alert(`
プロフィール
ユーザー名: ${appState.currentUser.username}
ジャンル: ${appState.currentUser.genre}
スキルレベル: ${appState.currentUser.skillLevel}
    `);
}

// 初期状態を設定
switchScreen('login');
