module.exports = {
    generateUser: function (context, events, done) {
        context.vars.email = `comprador${Math.floor(Math.random() * 10000)}_${Date.now()}@test.com`;
        context.vars.password = `Clave123!`;
        return done();
    }
};