module.exports = {
    wait: async (ms) => await new Promise(r => setTimeout(r, ms))
}