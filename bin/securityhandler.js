/**
 * Created by daeme_000 on 5-2-2015.
 */
module.exports = {
    'checkSU': function(req, next){
        if(req.user.isSuperAdmin){
            return next(new Error("forbidden"));
        }
        else
        {
            return true
        }
    },
    'checkAdmin': function(req, next, chronicleid){
        var allowed = false;
        for(c in req.user.chronicles){
            if(req.user.chronicles[c].id === chronicleid){
                allowed = true;
            }
        }

        if(!allowed && req.user.isSuperAdmin){
            return next(new Error("forbidden"));
        }
        else
        {
            return true
        }
    }
}