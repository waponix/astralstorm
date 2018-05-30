module.exports = ($s) => {
    return {
        circular: $s.lib.circularJson,
        pathMerge: function (str1, str2) {
            let rep = str2.split(/\\|\//);
            rep.forEach((r, key) => {
               rep[key] = new RegExp('[\\|\/]?' + r + '[\\|\/]?');
               str1 = str1.replace(rep[key], '');
            });
            return $s.lib.path.join(str1, str2);
        }
    };
};