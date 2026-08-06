$.global.CS = $.global.CS || {};
var CS = $.global.CS;

CS.Selector = {
    fillerWords: [
        "a", "an", "and", "are", "as", "at", "be", "but", "by", "for",
        "from", "had", "has", "have", "he", "her", "his", "i", "if", "in",
        "is", "it", "its", "just", "like", "me", "my", "of", "on", "or",
        "our", "she", "so", "that", "the", "their", "them", "then", "there",
        "this", "to", "uh", "um", "was", "we", "were", "with", "you", "your"
    ],

    selectRoles: function (words) {
        var hero = CS.Selector.selectHero(words);
        var accent = CS.Selector.selectAccent(words, hero);

        if (accent === "" && words.length > 1) {
            accent = words[0];
        }
        if (accent === hero && words.length > 1) {
            accent = words[0] === hero ? words[1] : words[0];
        }

        return {
            heroWord: hero,
            accentWord: accent
        };
    },

    selectHero: function (words) {
        var bestWord = words.length > 0 ? words[0] : "";
        var bestScore = -9999;
        var i;
        var score;

        for (i = 0; i < words.length; i += 1) {
            score = CS.Selector.scoreHeroWord(words[i], i, words.length);
            if (score > bestScore) {
                bestScore = score;
                bestWord = words[i];
            }
        }

        return bestWord;
    },

    scoreHeroWord: function (word, index, total) {
        var cleaned = CS.Utils.cleanWord(word).toLowerCase();
        var score = 0;

        if (cleaned === "") {
            return -9999;
        }
        if (CS.Selector.isFiller(cleaned)) {
            score -= 50;
        }
        if (index === 0 && total > 1) {
            score -= 6;
        }

        score += cleaned.length * 1.2;
        score += (index / Math.max(1, total - 1)) * 7;

        if (index === total - 1) {
            score += 3;
        }
        if (CS.Selector.looksActionLike(cleaned)) {
            score += 3;
        }
        if (cleaned.length <= 2) {
            score -= 8;
        }

        return score;
    },

    selectAccent: function (words, heroWord) {
        var heroIndex = CS.Utils.indexOfWord(words, heroWord);
        var bestWord = "";
        var bestScore = -9999;
        var i;
        var score;

        for (i = 0; i < words.length; i += 1) {
            if (String(words[i]).toLowerCase() === String(heroWord).toLowerCase()) {
                continue;
            }
            score = CS.Selector.scoreAccentWord(words[i], i, words.length, heroIndex, heroWord);
            if (score > bestScore) {
                bestScore = score;
                bestWord = words[i];
            }
        }

        return bestWord;
    },

    scoreAccentWord: function (word, index, total, heroIndex, heroWord) {
        var cleaned = CS.Utils.cleanWord(word).toLowerCase();
        var score = 0;
        var distance = Math.abs(index - heroIndex);
        var heroLength = String(heroWord).length;

        if (cleaned === "") {
            return -9999;
        }
        if (CS.Selector.isFiller(cleaned)) {
            score -= 40;
        }
        if (distance === 1) {
            score += 7;
        } else if (distance === 2) {
            score += 3;
        }
        if (CS.Selector.looksActionLike(cleaned)) {
            score += 4;
        }
        if (cleaned.length >= 4) {
            score += cleaned.length;
        }
        if (cleaned.length > heroLength + 4) {
            score -= 4;
        }
        score += (index / Math.max(1, total - 1)) * 2;

        return score;
    },

    isFiller: function (word) {
        return CS.Utils.contains(CS.Selector.fillerWords, word);
    },

    looksActionLike: function (word) {
        return /(ing|ed|ize|ise|ate|ify|en|move|make|build|start|stop|change|doing|done)$/i.test(word);
    }
};
