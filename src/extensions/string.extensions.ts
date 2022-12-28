interface String {
    removeWhiteSpaces(): string
}

String.prototype.removeWhiteSpaces = function () {
    return this.replace(/\s/g, '')
}
