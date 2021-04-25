window.addEventListener('keyup', function (event) {
    Key.onKeyUp(event);
}, false);
window.addEventListener('keydown', function(event) { 
    Key.onKeyDown(event); 
}, false);
var Key={
    _pressed: {},
    W:87,
    A:65,
    S:83,
    D:68,
    SPACE:32,
    isDown: function (key) {
        return this._pressed[key];
    },
    onKeyDown: function (event) {
        this._pressed[event.keyCode]=true;
    },
    onKeyUp: function (event) {
        delete this._pressed[event.keyCode];
    }
};