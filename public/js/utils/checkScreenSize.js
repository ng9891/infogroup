//TODO: Needs to be generalized for all types of screen resolutions

function LessThan17inch() {
    var screen_height = window.screen.availHeight;
    var screen_width = window.screen.availWidth;

    if (screen_width < 1920 && screen_height < 1040)
        return true;
    else 
        return false;
}

var LessThan17inch = LessThan17inch();