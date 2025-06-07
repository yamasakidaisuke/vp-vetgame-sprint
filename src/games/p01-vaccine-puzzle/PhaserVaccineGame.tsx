import React, { useEffect, useRef } from 'react';

interface PhaserVaccineGameProps {
  onBack: () => void;
}

export const PhaserVaccineGame: React.FC<PhaserVaccineGameProps> = ({ onBack }) => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const canvas = document.createElement('canvas');
    const isMobile = window.innerWidth < 768;
    // PC画面もスマホサイズに統一してゲーム難易度を同じにする
    canvas.width = 320;
    canvas.height = 568;
    canvas.style.border = '2px solid #333';
    canvas.style.borderRadius = '8px';
    canvas.style.touchAction = 'none';
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    gameRef.current.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    
    // ゲーム状態
    let gameRunning = true;
    let score = 0;
    let hp = 100;
    let level = 1;
    let enemiesKilled = 0;
    let showCardSelection = false;
    let selectedCards: any[] = [];
    
        // ウェーブ&リスクシステム
    let currentWave = 1;
    let enemiesInWave = 0; // 倒した敵の数
    let enemiesSpawned = 0; // スポーンした敵の数
    let enemiesPerWave = 5; // Wave1は5匹で簡単に
    let showRiskChoice = false;
    let scoreMultiplier = 1.0;
    // let baseScore = 0; // 撤退時の確定スコア (現在未使用)

    // アビリティシステム
    const playerAbilities = {
      fireRate: 1.2,        // 初期連射速度を少し下げる
      piercing: false,      // 貫通弾
      multiShot: 1,         // 多方向弾（弾数）
      explosiveShot: false, // 範囲攻撃
      bulletSpeed: 1,       // 弾速
      damage: 8             // 初期ダメージを下げる
    };

    // プレイヤー（画面中央で自由移動）
    const player = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      size: isMobile ? 20 : 30,
      speed: isMobile ? 4 : 6,
      emoji: '🏥'
    };

    // 弾丸システム
    let bullets: Array<{
      x: number;
      y: number;
      speed: number;
      emoji: string;
      size: number;
      angle: number;
      piercing: boolean;
      explosive: boolean;
      damage: number;
    }> = [];

    // 敵システム
    let enemies: Array<{
      x: number;
      y: number;
      hp: number;
      maxHp: number;
      speed: number;
      emoji: string;
      size: number;
    }> = [];

    // エフェクト
    let effects: Array<{
      x: number;
      y: number;
      text: string;
      color: string;
      time: number;
      dy: number;
    }> = [];

    // 操作状態
    const keys = {
      left: false,
      right: false,
      up: false,
      down: false
    };

    // キーボード操作
    function handleKeyDown(e: KeyboardEvent) {
      switch(e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          keys.left = true;
          break;
        case 'd':
        case 'arrowright':
          keys.right = true;
          break;
        case 'w':
        case 'arrowup':
          keys.up = true;
          break;
        case 's':
        case 'arrowdown':
          keys.down = true;
          break;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      switch(e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          keys.left = false;
          break;
        case 'd':
        case 'arrowright':
          keys.right = false;
          break;
        case 'w':
        case 'arrowup':
          keys.up = false;
          break;
        case 's':
        case 'arrowdown':
          keys.down = false;
          break;
      }
    }

    // タッチ操作（バーチャルパッド）
    let touchPad = {
      active: false,
      centerX: 0,
      centerY: 0,
      currentX: 0,
      currentY: 0
    };

    function handleTouchStart(e: TouchEvent) {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      touchPad.active = true;
      touchPad.centerX = (touch.clientX - rect.left) * (canvas.width / rect.width);
      touchPad.centerY = (touch.clientY - rect.top) * (canvas.height / rect.height);
      touchPad.currentX = touchPad.centerX;
      touchPad.currentY = touchPad.centerY;
    }

    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (!touchPad.active) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      touchPad.currentX = (touch.clientX - rect.left) * (canvas.width / rect.width);
      touchPad.currentY = (touch.clientY - rect.top) * (canvas.height / rect.height);
    }

    function handleTouchEnd(e: TouchEvent) {
      e.preventDefault();
      touchPad.active = false;
    }

    // アビリティカード定義
    const abilityCards = [
      {
        id: 'rapid_fire',
        name: '🔥 連射速度アップ',
        description: '弾丸の発射間隔が50%短縮',
        effect: () => { playerAbilities.fireRate *= 1.5; }
      },
      {
        id: 'piercing',
        name: '💎 貫通弾',
        description: '弾丸が敵を貫通する',
        effect: () => { playerAbilities.piercing = true; }
      },
      {
        id: 'multi_shot',
        name: '⚡ 多方向弾',
        description: '3方向に同時発射',
        effect: () => { playerAbilities.multiShot = Math.min(5, playerAbilities.multiShot + 2); }
      },
      {
        id: 'explosive',
        name: '💥 爆発弾',
        description: '弾丸が爆発して範囲ダメージ',
        effect: () => { playerAbilities.explosiveShot = true; }
      },
      {
        id: 'heal',
        name: '🛡️ HP回復',
        description: 'HPを25回復',
        effect: () => { hp = Math.min(100, hp + 25); }
      },
      {
        id: 'damage_up',
        name: '⚔️ ダメージアップ',
        description: 'ダメージが50%増加',
        effect: () => { playerAbilities.damage = Math.floor(playerAbilities.damage * 1.5); }
      }
    ];

    // カード選択処理
    function selectCard(cardIndex: number) {
      console.log('selectCard呼び出し:', cardIndex, selectedCards[cardIndex]); // デバッグログ
      
      if (selectedCards[cardIndex]) {
        console.log('カード効果実行前:', playerAbilities); // デバッグログ
        selectedCards[cardIndex].effect();
        console.log('カード効果実行後:', playerAbilities); // デバッグログ
        
        showEffect(canvas.width / 2, canvas.height / 2, selectedCards[cardIndex].name, '#ffd700');
        showCardSelection = false;
        gameRunning = true;
        
        console.log('ゲーム再開:', { showCardSelection, gameRunning }); // デバッグログ
      } else {
        console.log('selectedCards[cardIndex]が存在しません:', cardIndex, selectedCards); // デバッグログ
      }
    }

    // ウェーブクリア処理
    function waveComplete() {
      gameRunning = false;
      showRiskChoice = true;
      showEffect(canvas.width / 2, canvas.height / 2, `🎉 Wave ${currentWave} クリア！`, '#ffd700');
      
      // 次のウェーブの報酬倍率を設定
      const nextMultiplier = 1.0 + (currentWave * 0.5); // 1.0 → 1.5 → 2.0 → 2.5...
      
      console.log(`ウェーブ${currentWave}クリア！次の倍率: x${nextMultiplier}`);
    }

    // リスク選択処理
    function selectRisk(choice: 'continue' | 'retreat') {
      if (choice === 'retreat') {
        // 撤退：現在のスコアを確定
        showEffect(canvas.width / 2, canvas.height / 2, '🛡️ 撤退成功！', '#00ff00');
        setTimeout(() => {
          gameOver();
        }, 1000);
      } else {
        // 続行：次のウェーブへ
        currentWave++;
        
        // Wave10クリアでゲーム完全勝利！
        if (currentWave > 10) {
          showEffect(canvas.width / 2, canvas.height / 2, '🏆 完全勝利！', '#ffd700');
          score += 10000; // 勝利ボーナス
          setTimeout(() => {
            gameVictory();
          }, 2000);
          return;
        }
        
        scoreMultiplier = 1.0 + (currentWave - 1) * 0.5;
        enemiesInWave = 0;
        enemiesSpawned = 0; // スポーンカウンターをリセット
        enemiesPerWave = Math.min(25, 5 + currentWave * 3); // Wave2から段階的難易度上昇
        hp = Math.min(100, hp + 15); // 少しHP回復（上限100）
        
        showEffect(canvas.width / 2, canvas.height / 2, `⚔️ Wave ${currentWave} 開始！`, '#ff6600');
        showRiskChoice = false;
        gameRunning = true;
        
        console.log(`ウェーブ${currentWave}開始！倍率: x${scoreMultiplier}, 敵数: ${enemiesPerWave}`);
      }
    }

    // レベルアップ処理（3ウェーブごと）
    function levelUp() {
      level++;
      showEffect(canvas.width / 2, canvas.height / 2, 'LEVEL UP!', '#ffd700');
      
      // カード選択画面表示
      gameRunning = false;
      showCardSelection = true;
      
      // ランダムに3枚のカードを選択
      selectedCards = [];
      const shuffled = [...abilityCards].sort(() => Math.random() - 0.5);
      selectedCards = shuffled.slice(0, 3);
      
      console.log('レベルアップ！選択されたカード:', selectedCards); // デバッグログ
      console.log('ゲーム状態:', { gameRunning, showCardSelection, level }); // デバッグログ
    }

    // イベントリスナー
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // ゲーム操作用のタッチイベント（カード選択中は無効）
    canvas.addEventListener('touchstart', (e) => {
      if (!showCardSelection) handleTouchStart(e);
    });
    canvas.addEventListener('touchmove', (e) => {
      if (!showCardSelection) handleTouchMove(e);
    });
    // touchendは下の方でカード選択と統合処理

    // カード選択・リスク選択のクリックイベント（タッチも対応）
    function handleCardSelection(e: MouseEvent | TouchEvent) {
      if (!showCardSelection && !showRiskChoice) return;
      
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0]?.clientX || e.changedTouches[0]?.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY || e.changedTouches[0]?.clientY : e.clientY;
      
      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);
      
      console.log('クリック:', { x, y, showCardSelection, showRiskChoice }); // デバッグログ
      
      // リスク選択の判定
      if (showRiskChoice) {
        const buttonWidth = 120;
        const buttonHeight = 50;
        const buttonY = 220;
        const spacing = 20;
        
        const retreatX = canvas.width / 2 - buttonWidth - spacing / 2;
        const continueX = canvas.width / 2 + spacing / 2;
        
        console.log('リスク選択座標:', { 
          x, y, 
          retreatArea: { x: retreatX, y: buttonY, w: buttonWidth, h: buttonHeight },
          continueArea: { x: continueX, y: buttonY, w: buttonWidth, h: buttonHeight }
        });
        
        // 撤退ボタンクリック
        if (x >= retreatX && x <= retreatX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
          console.log('撤退を選択');
          selectRisk('retreat');
          return;
        }
        
        // 続行ボタンクリック
        if (x >= continueX && x <= continueX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
          console.log('続行を選択');
          selectRisk('continue');
          return;
        }
      }
      
      // カード選択の判定
      if (showCardSelection) {
        const cardWidth = isMobile ? 80 : 120;
        const cardHeight = isMobile ? 100 : 150;
        const cardSpacing = isMobile ? 20 : 30;
        const totalWidth = 3 * cardWidth + 2 * cardSpacing;
        const startX = (canvas.width - totalWidth) / 2;
        const cardY = canvas.height / 2 - cardHeight / 2;
        
        console.log('カードエリア:', { startX, cardY, cardWidth, cardHeight }); // デバッグログ
        
        for (let i = 0; i < 3; i++) {
          const cardX = startX + i * (cardWidth + cardSpacing);
          console.log(`カード${i}:`, { cardX, cardY, cardX2: cardX + cardWidth, cardY2: cardY + cardHeight }); // デバッグログ
          
          if (x >= cardX && x <= cardX + cardWidth && 
              y >= cardY && y <= cardY + cardHeight) {
            console.log(`カード${i}を選択`); // デバッグログ
            selectCard(i);
            break;
          }
        }
      }
    }

    // カード選択・リスク選択専用のタッチイベント（優先処理）
    canvas.addEventListener('touchstart', (e) => {
      if (showCardSelection || showRiskChoice) {
        e.preventDefault(); // デフォルトのタッチ動作を防ぐ
      }
    });
    
    canvas.addEventListener('touchend', (e) => {
      if (showCardSelection || showRiskChoice) {
        handleCardSelection(e);
      } else {
        handleTouchEnd(e);
      }
    });
    
    canvas.addEventListener('click', handleCardSelection);

    // エフェクト表示
    function showEffect(x: number, y: number, text: string, color: string) {
      effects.push({
        x,
        y,
        text,
        color,
        time: 60,
        dy: isMobile ? -1 : -2
      });
    }

    // 弾丸発射（全方向対応）
    function shootBullet() {
      const baseSpeed = (isMobile ? 8 : 12) * playerAbilities.bulletSpeed;
      
      // 最も近い敵を探す
      let targetAngle = -Math.PI / 2; // デフォルトは上向き（-90度）
      if (enemies.length > 0) {
        let closestEnemy = enemies[0];
        let closestDistance = Infinity;
        
        enemies.forEach(enemy => {
          const dx = enemy.x - player.x;
          const dy = enemy.y - player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestEnemy = enemy;
          }
        });
        
        // 最も近い敵に向かう角度を計算
        const dx = closestEnemy.x - player.x;
        const dy = closestEnemy.y - player.y;
        targetAngle = Math.atan2(dy, dx);
      }
      
      // 多方向弾の実装
      for (let i = 0; i < playerAbilities.multiShot; i++) {
        let shootAngle;
        if (playerAbilities.multiShot === 1) {
          shootAngle = targetAngle; // 最も近い敵に向かって
        } else {
          // 多方向弾：ターゲット角度を中心に扇状に発射
          const spreadAngle = Math.PI / 3; // 60度の扇
          const angleStep = spreadAngle / (playerAbilities.multiShot - 1);
          shootAngle = targetAngle - spreadAngle/2 + (i * angleStep);
        }
        
        bullets.push({
          x: player.x,
          y: player.y,
          speed: baseSpeed,
          emoji: playerAbilities.explosiveShot ? '💥' : '💉',
          size: 8,
          angle: shootAngle,
          piercing: playerAbilities.piercing,
          explosive: playerAbilities.explosiveShot,
          damage: playerAbilities.damage
        });
      }
    }

    // 敵スポーン（四方八方から）
    function spawnEnemy() {
      // Waveが進むにつれて敵が強化される
      const waveMultiplier = 1 + (currentWave - 1) * 0.3; // Wave1=1.0, Wave2=1.3, Wave3=1.6...
      
      const enemyTypes = [
        { emoji: '🦠', hp: Math.floor(12 * waveMultiplier), speed: 1.2 + (currentWave - 1) * 0.1 },
        { emoji: '🧬', hp: Math.floor(18 * waveMultiplier), speed: 1.0 + (currentWave - 1) * 0.1 },
        { emoji: '🔬', hp: Math.floor(10 * waveMultiplier), speed: 1.5 + (currentWave - 1) * 0.1 }
      ];
      
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      
      // 四方八方からのスポーン位置を決定
      const side = Math.floor(Math.random() * 4); // 0:上, 1:右, 2:下, 3:左
      let spawnX, spawnY;
      
      switch(side) {
        case 0: // 上から
          spawnX = Math.random() * canvas.width;
          spawnY = -30;
          break;
        case 1: // 右から
          spawnX = canvas.width + 30;
          spawnY = Math.random() * canvas.height;
          break;
        case 2: // 下から
          spawnX = Math.random() * canvas.width;
          spawnY = canvas.height + 30;
          break;
        case 3: // 左から
          spawnX = -30;
          spawnY = Math.random() * canvas.height;
          break;
        default:
          spawnX = Math.random() * canvas.width;
          spawnY = -30;
      }
      
      enemies.push({
        x: spawnX,
        y: spawnY,
        hp: type.hp,
        maxHp: type.hp,
        speed: type.speed * (isMobile ? 1.0 : 1.3), // スピードアップ
        emoji: type.emoji,
        size: isMobile ? 15 : 20
      });
      
      // スポーンカウンターを増加（重要！）
      enemiesSpawned++;
      console.log(`敵スポーン: ${enemiesSpawned}/${enemiesPerWave} (Wave ${currentWave}, 撃破: ${enemiesInWave})`); // デバッグログ
    }

    // 衝突判定（より緩い判定に調整）
    function checkCollision(obj1: any, obj2: any) {
      const dx = obj1.x - obj2.x;
      const dy = obj1.y - obj2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const collisionDistance = (obj1.size || 10) + (obj2.size || 10) + 10; // 判定を緩くする
      return distance < collisionDistance;
    }

    // プレイヤー更新（画面全体を自由移動）
    function updatePlayer() {
      // キーボード操作（画面全体移動可能）
      if (keys.left && player.x > player.size + 10) player.x -= player.speed;
      if (keys.right && player.x < canvas.width - player.size - 10) player.x += player.speed;
      if (keys.up && player.y > player.size + 50) player.y -= player.speed; // UI避け
      if (keys.down && player.y < canvas.height - player.size - 30) player.y += player.speed;

      // タッチ操作（画面全体移動可能）
      if (touchPad.active && isMobile) {
        const dx = touchPad.currentX - touchPad.centerX;
        const dy = touchPad.currentY - touchPad.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
          const moveX = (dx / distance) * player.speed;
          const moveY = (dy / distance) * player.speed;
          
          player.x = Math.max(player.size + 10, Math.min(canvas.width - player.size - 10, player.x + moveX));
          player.y = Math.max(player.size + 50, Math.min(canvas.height - player.size - 30, player.y + moveY));
        }
      }
    }

    // 弾丸更新（全方向移動対応）
    function updateBullets() {
      bullets = bullets.filter(bullet => {
        // 弾丸の移動（角度に基づく全方向）
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
                bullet.y += Math.sin(bullet.angle) * bullet.speed;
        
        // 敵との衝突チェック
        for (let i = enemies.length - 1; i >= 0; i--) {
          const enemy = enemies[i];
          if (checkCollision(bullet, enemy)) {
            enemy.hp -= bullet.damage;
            showEffect(enemy.x, enemy.y, `-${bullet.damage} HP`, '#ff6b6b');
            
            // 爆発弾の範囲ダメージ
            if (bullet.explosive) {
              enemies.forEach(otherEnemy => {
                const dx = otherEnemy.x - enemy.x;
                const dy = otherEnemy.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 50 && otherEnemy !== enemy) {
                  otherEnemy.hp -= bullet.damage / 2;
                  showEffect(otherEnemy.x, otherEnemy.y, `-${Math.floor(bullet.damage/2)}`, '#ff9999');
                }
              });
              showEffect(enemy.x, enemy.y, '💥 BOOM!', '#ffff00');
            }
            
            if (enemy.hp <= 0) {
              const points = Math.floor(100 * scoreMultiplier);
              score += points;
              enemiesKilled++;
              enemiesInWave++;
              showEffect(enemy.x, enemy.y, `+${points}`, '#51cf66');
              enemies.splice(i, 1);
              
              // ウェーブクリアチェック（全ての敵をスポーンし、すべて撃破した場合）
              if (enemiesSpawned >= enemiesPerWave && enemies.length === 0) {
                waveComplete();
              }
            }
            
            if (!bullet.piercing) {
              return false; // 貫通弾でない場合は弾丸削除
            }
          }
        }
        
        // 画面外に出た弾丸は削除
        return bullet.x > -50 && bullet.x < canvas.width + 50 && 
               bullet.y > -50 && bullet.y < canvas.height + 50;
      });
    }

    // 敵更新（プレイヤー追跡AI）
    function updateEnemies() {
      enemies = enemies.filter(enemy => {
        // プレイヤーを追いかける移動AI
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const moveX = (dx / distance) * enemy.speed;
          const moveY = (dy / distance) * enemy.speed;
          enemy.x += moveX;
          enemy.y += moveY;
        }
        
        // プレイヤーとの衝突チェック
        if (checkCollision(enemy, player)) {
          const damage = 8 + Math.floor(currentWave * 2); // Wave進行に合わせてダメージ増加
          hp -= damage;
          showEffect(player.x, player.y, `-${damage} HP`, '#ff0000');
          return false; // 敵削除
        }
        
        // 画面外に出すぎた敵は削除（スポーン失敗対策）
        return enemy.x > -100 && enemy.x < canvas.width + 100 && 
               enemy.y > -100 && enemy.y < canvas.height + 100;
      });
    }

    // エフェクト更新
    function updateEffects() {
      effects = effects.filter(effect => {
        effect.time--;
        effect.y += effect.dy;
        return effect.time > 0;
      });
    }

    // 描画
    function render() {
      // 背景
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // HUD
      ctx.fillStyle = '#ffffff';
      ctx.font = `${isMobile ? 10 : 16}px Arial`;
      ctx.textAlign = 'left';
      ctx.fillText(`HP: ${hp}`, 10, 25);
      
      ctx.textAlign = 'center';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, 25);
      
      ctx.textAlign = 'right';
      ctx.fillText(`Wave: ${currentWave}`, canvas.width - 10, 25);
      
      // ウェーブ進行度とスコア倍率
      ctx.fillStyle = '#ffff00';
      ctx.font = `${isMobile ? 8 : 12}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(`${enemiesInWave}/${enemiesSpawned} 撃破 (全${enemiesPerWave}匹)`, canvas.width / 2, 45);
      if (scoreMultiplier > 1) {
        ctx.fillText(`倍率: x${scoreMultiplier.toFixed(1)}`, canvas.width / 2, isMobile ? 60 : 65);
      }

      // プレイヤー描画
      ctx.font = `${player.size * 2}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(player.emoji, player.x, player.y + player.size / 2);

      // 弾丸描画（デバッグ用の円も表示）
      ctx.font = `${isMobile ? 16 : 20}px Arial`;
      bullets.forEach(bullet => {
        // デバッグ用：弾丸の当たり判定を可視化
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText(bullet.emoji, bullet.x, bullet.y);
      });

      // 敵描画
      enemies.forEach(enemy => {
        // デバッグ用：敵の当たり判定を可視化
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.font = `${enemy.size * 2}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(enemy.emoji, enemy.x, enemy.y + enemy.size / 2);
        
        // HPバー
        const barWidth = isMobile ? 30 : 40;
        const barHeight = 4;
        const hpRatio = enemy.hp / enemy.maxHp;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 10, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 10, barWidth * hpRatio, barHeight);
      });

      // エフェクト描画
      effects.forEach(effect => {
        ctx.fillStyle = effect.color;
        ctx.font = `bold ${isMobile ? 12 : 16}px Arial`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = effect.time / 60;
        ctx.fillText(effect.text, effect.x, effect.y);
        ctx.globalAlpha = 1;
      });

      // タッチパッド描画（モバイル）
      if (touchPad.active && isMobile) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(touchPad.centerX, touchPad.centerY, 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(touchPad.currentX, touchPad.currentY, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // カード選択画面
      if (showCardSelection) {
        // 背景を暗くする
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${isMobile ? 20 : 32}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('🎉 レベルアップ！', canvas.width / 2, isMobile ? 80 : 120);
        
        ctx.font = `${isMobile ? 12 : 18}px Arial`;
        ctx.fillText('アビリティを選択してください', canvas.width / 2, isMobile ? 100 : 150);
        
        // カード描画
        const cardWidth = isMobile ? 80 : 120;
        const cardHeight = isMobile ? 100 : 150;
        const cardSpacing = isMobile ? 20 : 30;
        const totalWidth = 3 * cardWidth + 2 * cardSpacing;
        const startX = (canvas.width - totalWidth) / 2;
        const cardY = canvas.height / 2 - cardHeight / 2;
        
        for (let i = 0; i < 3; i++) {
          const cardX = startX + i * (cardWidth + cardSpacing);
          
          // カード背景
          ctx.fillStyle = '#2a2a4a';
          ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
          
          // カード内容
          if (selectedCards[i]) {
            const card = selectedCards[i];
            
            // カード名
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${isMobile ? 10 : 14}px Arial`;
            ctx.textAlign = 'center';
            
            // テキストを複数行に分割
            const lines = card.name.match(/.{1,8}/g) || [card.name];
            lines.forEach((line: string, lineIndex: number) => {
              ctx.fillText(line, cardX + cardWidth/2, cardY + 20 + lineIndex * 15);
            });
            
            // 説明文
            ctx.font = `${isMobile ? 8 : 10}px Arial`;
            ctx.fillStyle = '#cccccc';
            const descLines = card.description.match(/.{1,12}/g) || [card.description];
            descLines.forEach((line: string, lineIndex: number) => {
              ctx.fillText(line, cardX + cardWidth/2, cardY + 50 + lineIndex * 12);
            });
          }
        }
        
        // 選択指示
        ctx.fillStyle = '#ffffff';
        ctx.font = `${isMobile ? 10 : 14}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('カードをクリック/タップして選択', canvas.width / 2, canvas.height - (isMobile ? 30 : 50));
      }

      // リスク選択画面
      if (showRiskChoice) {
        // 背景を暗くする
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 運命の選択', canvas.width / 2, 80);
        
        // 現在の状況
        ctx.font = '14px Arial';
        ctx.fillStyle = '#ffff00';
        ctx.fillText(`現在のスコア: ${score}`, canvas.width / 2, 110);
        
        // Wave進行状況
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`Wave ${currentWave}/10 クリア`, canvas.width / 2, 130);
        
        if (currentWave < 10) {
          const nextMultiplier = 1.0 + (currentWave * 0.5);
          ctx.fillStyle = '#ffff00';
          ctx.fillText(`次ウェーブ倍率: x${nextMultiplier.toFixed(1)}`, canvas.width / 2, 150);
        } else {
          ctx.fillStyle = '#ffd700';
          ctx.fillText('🏆 最終ウェーブクリア！', canvas.width / 2, 150);
        }
        
        // 選択肢ボタン（canvas統一サイズに合わせて調整）
        const buttonWidth = 120;
        const buttonHeight = 50;
        const buttonY = 220;
        const spacing = 20;
        
        // 撤退ボタン
        const retreatX = canvas.width / 2 - buttonWidth - spacing / 2;
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(retreatX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(retreatX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('🛡️ 撤退', retreatX + buttonWidth/2, buttonY + buttonHeight/2 + 5);
        ctx.font = '10px Arial';
        ctx.fillText('スコア確定', retreatX + buttonWidth/2, buttonY + buttonHeight/2 + 20);
        
        // 続行ボタン
        const continueX = canvas.width / 2 + spacing / 2;
        ctx.fillStyle = '#FF5722';
        ctx.fillRect(continueX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(continueX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('⚔️ 続行', continueX + buttonWidth/2, buttonY + buttonHeight/2 + 5);
        ctx.font = '10px Arial';
        ctx.fillText('報酬倍増！', continueX + buttonWidth/2, buttonY + buttonHeight/2 + 20);
        
        // 警告文
        ctx.fillStyle = '#ff6666';
        ctx.font = '12px Arial';
        ctx.fillText('⚠️ 続行して失敗すると大幅減点！', canvas.width / 2, canvas.height - 40);
      }

      // 操作説明（カード選択中でない場合のみ）
      if (!showCardSelection) {
        if (isMobile) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('画面をタップ&ドラッグで移動', canvas.width / 2, canvas.height - 10);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('WASD or Arrow Keys で移動', canvas.width / 2, canvas.height - 10);
        }
      }
    }

    // ゲーム勝利
    function gameVictory() {
      gameRunning = false;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 勝利画面
      ctx.fillStyle = '#ffd700';
      ctx.font = `bold ${isMobile ? 28 : 42}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('🏆 VICTORY! 🏆', canvas.width / 2, canvas.height / 2 - 80);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${isMobile ? 18 : 28}px Arial`;
      ctx.fillText('全10ウェーブクリア！', canvas.width / 2, canvas.height / 2 - 40);
      
      ctx.font = `${isMobile ? 16 : 24}px Arial`;
      ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
      ctx.fillText(`Enemies Killed: ${enemiesKilled}`, canvas.width / 2, canvas.height / 2 + 30);
      
      ctx.fillStyle = '#ffd700';
      ctx.font = `${isMobile ? 14 : 18}px Arial`;
      ctx.fillText('あなたは真のメディカルヒーロー！', canvas.width / 2, canvas.height / 2 + 60);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `${isMobile ? 12 : 16}px Arial`;
      ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 90);
      
      canvas.addEventListener('click', () => location.reload());
    }

    // ゲームオーバー
    function gameOver() {
      gameRunning = false;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${isMobile ? 24 : 36}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
      
      ctx.font = `${isMobile ? 16 : 24}px Arial`;
      ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
      ctx.fillText(`Enemies Killed: ${enemiesKilled}`, canvas.width / 2, canvas.height / 2 + 30);
      
      ctx.font = `${isMobile ? 12 : 16}px Arial`;
      ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 70);
      
      canvas.addEventListener('click', () => location.reload());
    }

    // ゲームループ
    let lastTime = 0;
    let bulletTimer = 0;
    let enemyTimer = 0;

    function gameLoop(currentTime: number) {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // 描画は常に実行（カード選択画面も表示するため）
      render();

      // ゲームロジックはgameRunningがtrueの時のみ
      if (!gameRunning) {
        requestAnimationFrame(gameLoop);
        return;
      }

      // 常に最低限の敵数を維持（緊張感保持）
      const minEnemies = Math.min(6, 2 + currentWave);
      if (enemies.length < minEnemies && enemiesSpawned < enemiesPerWave) {
        spawnEnemy();
      }

      // プレイヤー更新
      updatePlayer();

      // 自動射撃（アビリティによる連射速度調整）
      bulletTimer += deltaTime;
      const fireRate = (isMobile ? 400 : 300) / playerAbilities.fireRate;
      if (bulletTimer > fireRate) {
        shootBullet();
        bulletTimer = 0;
      }

      // 敵スポーン（より高頻度で大群）
      enemyTimer += deltaTime;
      const spawnRate = Math.max(800, 2000 - (currentWave * 100)); // スポーン頻度を調整
      if (enemyTimer > spawnRate && enemiesSpawned < enemiesPerWave) {
        // 大群でスポーン（複数体同時）
        const spawnCount = Math.min(2, 1 + Math.floor(currentWave / 3));
        for (let i = 0; i < spawnCount && enemiesSpawned < enemiesPerWave; i++) {
          spawnEnemy();
        }
        enemyTimer = 0;
      }

      // 更新
      updateBullets();
      updateEnemies();
      updateEffects();

      // レベルアップ（3ウェーブごと）
      const newLevel = Math.floor(currentWave / 3) + 1;
      if (newLevel > level) {
        levelUp();
      }

      // ゲームオーバーチェック
      if (hp <= 0) {
        // ウェーブ挑戦中の失敗はペナルティ
        if (currentWave > 1) {
          const penalty = Math.floor(score * 0.5); // 50%減点
          score = Math.max(0, score - penalty);
          showEffect(canvas.width / 2, canvas.height / 2, `💀 -${penalty}`, '#ff0000');
        }
        gameOver();
        return;
      }

      requestAnimationFrame(gameLoop);
    }

    // ゲーム開始
    requestAnimationFrame(gameLoop);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (gameRef.current && canvas.parentNode) {
        gameRef.current.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div className="flex flex-col flex-wrap items-center p-2 md:p-6 min-h-screen bg-gray-50 w-full overflow-hidden">
      {/* ヘッダー部分 */}
      <div className="w-full max-w-xs md:max-w-none mb-3 md:mb-6">
        <div className="flex justify-start mb-2 md:mb-3">
          <button
            onClick={onBack}
            className="px-3 py-2 md:px-4 md:py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm md:text-base"
          >
            ← 戻る
          </button>
        </div>
        <h1 className="text-base md:text-2xl font-bold text-center break-words">
          🎮 メディカル・ダンジョン
        </h1>
      </div>
      
      {/* ゲーム画面 */}
      <div className="bg-white p-1 md:p-4 rounded-lg shadow-lg w-full max-w-xs md:max-w-none flex justify-center mb-3 md:mb-6">
        <div ref={gameRef}></div>
      </div>
      
      {/* 説明部分 */}
      <div className="w-full max-w-xs md:max-w-none px-2 md:px-4">
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm text-center">
          <p className="mb-2 font-medium text-purple-600 text-xs md:text-sm break-words">
            🎯 病原菌を撃退せよ！
          </p>
          <p className="mb-3 font-medium text-red-500 text-xs md:text-sm break-words">
            💊 自動射撃で敵を倒そう
          </p>
          <div className="flex flex-wrap justify-center items-center gap-2 text-xs md:text-sm text-gray-500 border-t pt-2">
            <div className="flex-shrink-0">📱 タップ&ドラッグで移動</div>
            <div className="flex-shrink-0">💻 WASD/矢印キーで移動</div>
            <div className="w-full flex justify-center mt-1">
              <span className="font-medium text-gray-700">
                病原菌を倒してスコアアップ！
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 