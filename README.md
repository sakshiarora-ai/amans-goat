# Aman's GOAT

Public creator-intelligence dashboard for [@aman.enlights](https://www.instagram.com/aman.enlights/), covering geopolitics, Indian politics, national news, creator signals, and content planning.

## Public app

The web app is published at <https://sakshiarora-ai.github.io/amans-goat/>. A scheduled GitHub workflow rebuilds the news dataset every hour and places newer reports first.

## macOS companion

Download the latest Apple Silicon installer from the repository's **Releases** page. The companion adds a floating **AG** button with shortcuts to My Feed, To-Dos, News Radar, Creator's Intel, and Content Studio.

Because this first test build is not Apple-notarized, macOS may require **Control-click → Open** the first time.

## Local development

```bash
npm install
npm run news:update
npm run dev
```
