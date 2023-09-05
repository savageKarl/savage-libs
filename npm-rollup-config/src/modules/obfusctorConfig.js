export const obfusctorConfig = {
	compact: true, // 从输出混淆代码中删除换行符。
	controlFlowFlattening: true, // 此选项极大地影响了运行速度降低1.5倍的性能。 启用代码控制流展平。控制流扁平化是源代码的结构转换，阻碍了程序理解。
	controlFlowFlatteningThreshold: 1,
	deadCodeInjection: false, // 此选项大大增加了混淆代码的大小（最多200％） 此功能将随机的死代码块（即：不会执行的代码）添加到混淆输出中，从而使得更难以进行反向工程设计。
	deadCodeInjectionThreshold: 1,
	// debugProtection: false, // 调试保护  如果您打开开发者工具，可以冻结您的浏览器。
	debugProtectionInterval: false, // 如果选中，则会在“控制台”选项卡上使用间隔强制调试模式，这使得使用“开发人员工具”的其他功能变得更加困难。它是如何工作的？一个调用调试器的特殊代码;在整个混淆的源代码中反复插入。注意：多模块的工具库不要开启，否则rollup报错
	disableConsoleOutput: false, // 通过用空函数替换它们来禁用console.log，console.info，console.error和console.warn。这使得调试器的使用更加困难。注意：库开发的不要启动这个选项，不然导出的函数的不会执行
	identifierNamesGenerator: 'hexadecimal', // 标识符的混淆方式 hexadecimal(十六进制) mangled(短标识符)
	log: false,
	renameGlobals: false, // 不要启动 通过声明启用全局变量和函数名称的混淆。
	rotateStringArray: false,
	selfDefending: false, // 此选项使输出代码能够抵抗格式化和变量重命名。如果试图在混淆代码上使用JavaScript美化器，代码将不再起作用，使得理解和修改它变得更加困难。需要紧凑代码设置。
	shuffleStringArray: false,
	splitStrings: false,
	splitStringsChunkLength: 10,
	stringArray: false, // 将stringArray数组移位固定和随机（在代码混淆时生成）的位置。这使得将删除的字符串的顺序与其原始位置相匹配变得更加困难。如果原始源代码不小，建议使用此选项，因为辅助函数可以引起注意。注意：多模块的工具库不要开启，否则rollup报错
	stringArrayEncoding: 'rc4', // 此选项可能会略微降低脚本速度。使用Base64或RC4对stringArray的所有字符串文字进行编码，并插入一个特殊的函数，用于在运行时将其解码回来。
	// stringArrayThreshold: 1,// 您可以使用此设置调整字符串文字将插入stringArray的概率（从0到1）。此设置在大型代码库中很有用，因为对stringArray函数的重复调用会降低代码的速度。
	// transformObjectKeys: false,// 转换（混淆）对象键。例如，此代码var a = {enabled：true};使用此选项进行模糊处理时，将隐藏已启用的对象键：var a = {};a [_0x2ae0 [（'0x0'）] = true;。 理想情况下与String Array设置一起使用。
	unicodeEscapeSequence: true // 将所有字符串转换为其unicode表示形式。例如，字符串“Hello World！”将被转换为“'\ x48 \ x65 \ x6c \ x6c \ x6f \ x20 \ x57 \ x6f \ x72 \ x6c \ x64 \ x21”。
	//     // ... [See more](https://github.com/javascript-obfuscator/javascript-obfuscator)
	//   }
	// }),
}
