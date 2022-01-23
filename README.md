# 用 2D 物理引擎 Matterjs 製作經典馬力歐 1-1

嗨～大家好，我是 Johnny，最近台灣本土疫情稍為刺激，週末待在家閒著無聊，剛好前陣子學了一款 2D 物理引擎[Matterjs](https://brm.io/matter-js/) 想說來試著用它做點東西。

今天這篇是一個實作紀錄，主要紀錄如何使用 Matterjs 製作一個橫向捲軸式遊戲～

因為馬力歐算是這種遊戲的經典款，網路上相關資源也蠻多，就決定是馬力歐拉，礙於篇幅會過長，本篇只會聚焦在開發想法上面喔

製作完的[成品在這](https://johnnywang1994.github.io/p5-game/#/matter-mario)，歡迎前往玩看看喔～


## 技術選擇
首先要製作一個 2D 網頁遊戲最重要的就是技術選擇，因為這次是以練習 Matterjs 及原生手做能力為主，所以沒有過多的考慮，平常如果要開發遊戲的話，可以選擇像是 Phaserjs 這種遊戲框架會方便很多～


## 前置思考
製作前需要先確定一下哪先部分可以交給 Matterjs，哪些部分需要我們自己手動完成

### Matterjs 代勞
1. 物件渲染（Body）
2. 物理特性（位置、速度、重力、碰撞）

### 手動
1. 動畫渲染（Animation）
2. 流程、機制控制（Trigger）
3. 操控事件（Controller）
4. 素材載入（Loader）
5. 音效處理（Howler）


## 實作過程
實作過程中主要碰到了以下幾個困難

### 素材在多個地方分開載入
這個問題其實就是製作一個素材 Loader，統一在一個地方載入素材後，其他地方只需要調用這個 Loader 返回的結果就行了

```js
const loader = new Loader();

loader.add('mario', '/cdn/mario.png');

(async () => {
  // 等待素材載入（Promise.all）
  await loader.load();
  // 開始遊戲
  startGame();
})();
```

### 創建動畫
Matterjs 主要只負責物理特性部分，動畫部分可以透過抽象將邏輯拆出去，由外部注入函數來創建動畫對象，並且添加 Matterjs 的 render events "afterRender" 內進行渲染

```js
Events.on(render, 'afterRender', () => {
  // ... dome some animation
});
```

### 同一物件多種動畫
這個可以透過在物件中添加 status 來控制，每當切換狀態時執行不同的動畫即可

### 同類型物件歸類
物件之間彼此或多或少都會有關聯，比如蘑菇、烏龜都是「敵人」，此時可以創建 Matterjs 的 group 來分類，這樣在後續判定 Collision 碰撞時可以提升效率，否則每個物件都必須寫一次碰撞就比較繁瑣了

### 橫向捲軸跟隨
橫向捲軸有兩種，一種是 loop 類型也就是 Camera 固定，背景持續重複，而馬力歐屬於第二類，背景為長條狀，Camera 跟隨人物移動，製作上可以添加 bounds 邊界概念，而使用 Matterjs 則可以用 Bounds 內建模組將 render.bounds 進行移動來達成

```js
function checkBounds() {
  const { position, velocity: vel } = this.body;
  const { min, max } = render.bounds;
  if (vel.x < 0 && min.x < 0) {
    // no move
  } else if (vel.x > 0 && max.x > config.mapWidth) {
    // no move
  } else if (position.x > min.x+config.width * 1 / 2 && vel.x > 0) {
    Bounds.translate(render.bounds, {
      x: vel.x,
      y: 0,
    });
  } else if (position.x < min.x+config.width * 1 / 2 && vel.x < 0) {
    Bounds.translate(render.bounds, {
      x: vel.x,
      y: 0,
    });
  }
}
```


## 結論
必須說，真的是術業有專攻，製作遊戲真的是異常辛苦，希望大家平日玩遊戲遇到 bug 時都能冷靜一點哈哈哈，因為真的是非常非常辛苦，製作難免會有一些缺漏或不完美，透過親身製作一次真的可以體會...

今天就介紹到這拉～感謝大家觀看 =V=!!

<h3>DISCLAIMER</h3>
<p>This project is intended for non-commercial educational purposes.</p>