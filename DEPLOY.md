# 🚀 GitHub Pages デプロイ手順

## 現在の状況

- **リポジトリ**: `guheheP/claudetest`
- **ブランチ**: `claude/dice-clicker-game-011CUNPk9sauLcNMvwyyreUe`
- **ゲームファイル**: すべてルートディレクトリに配置済み

## デプロイ手順（GitHub UI）

### 方法1: 現在のブランチから直接デプロイ（推奨）

1. **GitHubリポジトリにアクセス**
   ```
   https://github.com/guheheP/claudetest
   ```

2. **Settings（設定）を開く**
   - リポジトリページの上部メニューから「Settings」をクリック

3. **Pages設定を開く**
   - 左サイドバーから「Pages」をクリック

4. **Source（ソース）を設定**
   - **Branch**: `claude/dice-clicker-game-011CUNPk9sauLcNMvwyyreUe` を選択
   - **Directory**: `/ (root)` を選択
   - 「Save」ボタンをクリック

5. **デプロイ完了を待つ**
   - 数分待つとデプロイが完了します
   - ページ上部に緑色のバーと共にURLが表示されます
   ```
   Your site is live at https://guheheP.github.io/claudetest/
   ```

6. **ゲームにアクセス**
   - 表示されたURLをクリックしてゲームをプレイ！

---

### 方法2: mainブランチを作成してデプロイ（標準的な方法）

現在のブランチ制限により、以下の手順が必要です：

#### Step 1: Pull Requestを作成（推奨）

1. **GitHubリポジトリにアクセス**
   ```
   https://github.com/guheheP/claudetest
   ```

2. **Pull Requestsタブを開く**

3. **"New pull request"をクリック**

4. **ブランチを選択**
   - **base**: `main`（または新規作成）
   - **compare**: `claude/dice-clicker-game-011CUNPk9sauLcNMvwyyreUe`

5. **"Create pull request"をクリック**

6. **Pull Requestをマージ**
   - レビュー後、「Merge pull request」をクリック
   - 「Confirm merge」をクリック

7. **GitHub Pagesを設定**
   - Settings → Pages
   - Branch: `main`
   - Directory: `/ (root)`
   - Save

#### Step 2: ローカルでmainブランチを作成（代替案）

もしリポジトリの管理権限がある場合：

```bash
# 注意: この方法は403エラーが出る可能性があります

# mainブランチを作成
git checkout -b main

# リモートにプッシュ（権限があれば）
git push -u origin main

# その後、GitHub UIでPages設定
```

---

## デプロイ後の確認

### 1. URLにアクセス
```
https://guheheP.github.io/claudetest/
```

### 2. 動作確認チェックリスト

- [ ] ページが正しく読み込まれる
- [ ] サイコロが表示される
- [ ] クリックでサイコロが振れる
- [ ] アップグレードタブが表示される
- [ ] セーブ/ロードが機能する
- [ ] レスポンシブデザインが正しく表示される

### 3. エラーが出る場合

#### ページが表示されない
- デプロイが完了するまで数分待つ
- ブラウザのキャッシュをクリア（Ctrl+Shift+R / Cmd+Shift+R）
- GitHub Actions タブでデプロイ状況を確認

#### CSSが読み込まれない
- index.htmlのパスが相対パスになっていることを確認
- 現在のコードは問題ありません（相対パス使用）

#### JavaScriptエラー
- ブラウザの開発者ツール（F12）でコンソールを確認
- エラーがあれば報告してください

---

## トラブルシューティング

### 404 Not Found
- GitHub Pagesの設定が正しいか確認
- ブランチ名とディレクトリパスが正しいか確認
- デプロイが完了しているか Actions タブで確認

### ブランチが選択できない
- ブランチがリモートにプッシュされているか確認
  ```bash
  git branch -a
  ```
- プッシュされていない場合、再度プッシュ

### デプロイが遅い
- GitHub Pagesのデプロイには通常1〜5分かかります
- 混雑時は10分以上かかることもあります
- GitHub Status (https://www.githubstatus.com/) を確認

---

## カスタムドメインの設定（オプション）

独自ドメインを使いたい場合：

1. **ドメインを取得**
   - Namecheap, Google Domains, Cloudflare など

2. **DNSレコードを設定**
   ```
   Type: CNAME
   Name: www (or @)
   Value: guheheP.github.io
   ```

3. **GitHub Pagesで設定**
   - Settings → Pages
   - Custom domain に独自ドメインを入力
   - Save

4. **HTTPS を有効化**
   - "Enforce HTTPS" にチェック

---

## デプロイ後の更新方法

コードを更新した場合：

1. **ファイルを編集**
2. **コミット**
   ```bash
   git add .
   git commit -m "Update game"
   ```
3. **プッシュ**
   ```bash
   git push origin claude/dice-clicker-game-011CUNPk9sauLcNMvwyyreUe
   ```
4. **自動的に再デプロイ**
   - GitHub Pagesが自動的に更新を検知
   - 数分後に反映されます

---

## まとめ

**最も簡単な方法**: 方法1（現在のブランチから直接デプロイ）

1. GitHub Settings → Pages
2. Branch: `claude/dice-clicker-game-011CUNPk9sauLcNMvwyyreUe`
3. Directory: `/ (root)`
4. Save
5. 数分待つ
6. URLにアクセス！

**URL（予想）**:
```
https://guheheP.github.io/claudetest/
```

何か問題があればお知らせください！
