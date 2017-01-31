define(['superagent', '../settings', 'q'], function (Superagent, Settings, Q) {

    var Game = function(){
          this.loggedIn = false;
          this.gameId = 0;
          this.gameStatus = false;
          this.gameWasStarted = false;
          this.giveUpCode = 0;
    };

    Game.prototype.getGameId = function(){
        var defer = Q.defer();

        Superagent
                .get(Settings.host + Settings.api + '/game/new')
                .set('Accept', 'application/json')
                .end((error, response) => /* arrow function */{
                    if(!error || response.body.length > 0){
                        this.gameId = JSON.parse(response.text).id;
console.log(this.gameId);
                        // Tell all listeners that game id is changed
                        this.triggerChangeGameId();

                        defer.resolve();
                    } else {
                        defer.reject();
                    }
                });
            return defer.promise;
    };

    Game.prototype.logIn = function(user, password){
        var defer = Q.defer();

        Superagent
            .get(Settings.host + Settings.api + '/login')
            .set('Accept', 'application/json')
            .auth(user, password, {type:'auto'})
            .end((error, response) => /* arrow function */{
                if(response.body.result === true){
                    //set Cookies
                    localStorage.setItem('userLoggedIn', 'true');

                    this.loggedIn = true;
                    defer.resolve();
                } else {
                    this.loggedIn = false;
                    defer.reject();
                }
            });

        return defer.promise;
    };
    
     Game.prototype.getGameStatus = function (){
         var defer = Q.defer();
         
         Superagent
            .get(Settings.host + Settings.api + '/game/status')
            .set('Accept', 'application/json')
            .end((error, response) => /* arrow function */{
                this.gameId = JSON.parse(response.text).id;
                
                
                if (!error) {
                    this.loggedIn = true;
                    defer.resolve();
                } else {
                    this.loggedIn = false;
                    defer.reject();
                }
            });

        return defer.promise;
    };
    
    Game.prototype.giveUp = function (){
        
        return Q.promise((resolve, reject) => {
            Superagent
                .get(Settings.host + Settings.api + '/game/over/giveup')
                .set('Accept', 'application/json')
                .query({
                    game_id: this.gameId
                })
                .end((error, response) => {
                    if (error) {
                        return reject(error);
                    }
                    
                    this.giveUpCode =  response.body.gameStatus.code;
                    
                    this.changeGameWasStarted(false);
                                        
                    resolve(this.giveUpCode);
                });
        });
    };
    Game.prototype.timeOut = function (){
        return Q.promise((resolve, reject) => {
            Superagent
                .get(Settings.host + Settings.api + '/game/over/timeup')
                .set('Accept', 'application/json')
                .query({
                    game_id: this.gameId
                })
                .end((error, response) => {
                    if (error) {
                        return reject(error);
                    }
                    
                    this.timeOutCode =  response.body.gameStatus.code;
                    
                    this.changeGameWasStarted(false);
                                        
                    resolve(this.timeOutCode);
                });
        });
    };
    
    Game.prototype.setLogIn = function(){
        var defer = Q.defer();
        this.loggedIn = true;
        defer.resolve();
        return defer.promise;
    };
    
    Game.prototype.changeGameWasStarted = function (value){
        this.gameWasStarted = value;
    };

    Game.prototype.logOut = function(){
        var defer = Q.defer();
         
         Superagent
            .get(Settings.host + Settings.api + '/logout')
            .set('Accept', 'application/json')
            .end((error, response) => /* arrow function */{
                if (!error) {
                    this.loggedIn = false;
                    //set Cookies
                    localStorage.setItem('userLoggedIn', 'false');
                    location.href = '#/login';
                    defer.resolve();
                } else {
                    this.loggedIn = true;
                    defer.reject();
                }
            });

        return defer.promise;
    };

    Game.prototype.isLoggedIn = function(){
        return this.loggedIn;
    };

    Game.prototype.onChangeGameId = function (callback) {
        if (!this.callbacks) {
            this.callbacks = [];
        }

        this.callbacks.push(callback);
    };

    Game.prototype.offChangeGameId = function (callback) {
        if (!this.callbacks) {
            return;
        }


        this.callbacks = this.callbacks.filter(cb => {
            return cb !== callback;
        });
        
    };

    Game.prototype.triggerChangeGameId = function () {
        if (!this.callbacks) {
            return;
        }

        this.callbacks.forEach(callback => {
            callback(this.gameId);
        });
    };
    
    Game.prototype.getRegion = function (index) {
        var regions = ['Запорожская', 'Днепропетровская', 'Херсонская', 'Одесская', 'Автономная Республика Крым', 'Николаевская', 'Кировоградская', 'Донецкая', 'Луганская', 'Харьковская', 'Сумская', 'Полтавская', 'Черкасская', 'Винницкая', 'Черниговская', 'Киевская', 'Житомирская', 'Хмельницкая', 'Черновицкая', 'Тернопольская', 'Ровенская', 'Волынская', 'Ивано-Франковская', 'Львовская', 'Закарпатская'];
        
        return index === 5 ? regions[index - 1] : regions[index - 1] + ' область';
    };
    
    return Game;
});
