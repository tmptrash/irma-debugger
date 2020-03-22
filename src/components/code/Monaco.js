/**
 * Responsible for Monaco code editor
 * 
 * @author flatline
 */
class Monaco {
    /**
     * Inits monaco module, which is responsible for adding new language to Monaco editor
     * @param {Monaco} monaco 
     */
    static init(monaco) {
        monaco.languages.register({ id: 'line' });
        monaco.languages.setMonarchTokensProvider('line', {
            keywordsCore : ['toggle','eq','nop','add','sub','mul','div','inc','dec','rshift','lshift','rand','nand','age','line','len','left','right','save','load','savea','loada','read'],
            keywordsBlock: ['func', 'loop', 'ifg', 'ifl', 'ife', 'ifne', 'ifp', 'ifn', 'ifz', 'end'],
            keywordsFlow : ['ret','break','cont','call'],
            keywordsBio  : ['join','split','step','see','say','listen','nread','get','put','offs','color','anab','catab','mol','mmol','smol','rmol','lmol','cmol','mcmp','find','reax','dir','lhead','rhead'],
            tokenizer: {
                root: [
                    [/\s*\d+/, "line-num"],
                    [/[a-z0-9]+/, {cases: {'@keywordsCore': "line-core", '@keywordsBio': "line-bio", '@keywordsBlock': "line-block", '@keywordsFlow': "line-flow"}}],
                    [/\s*#.*/, "line-comment"],
                    [/@\s*[a-zA-Z_\$][\w\$]*/, 'line-ann']
                ]
            }
        });
        monaco.editor.defineTheme('lineTheme', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'line-core',    foreground: '005c80' },
                { token: 'line-block',   foreground: 'ff8040' },
                { token: 'line-flow',    foreground: 'ffa274' },
                { token: 'line-num',     foreground: '008040', fontStyle: 'bold' },
                { token: 'line-comment', foreground: '555555' },
                { token: 'line-bio',     foreground: '005c00' },
                { token: 'line-ann',     foreground: '555555' }
            ]
        });
    }

    static getOptions() {
        return {
            selectOnLineNumbers: true,
            lineNumbers: 'off',
            scrollBeyondLastLine: false
        };
    }
}

module.exports = Monaco;