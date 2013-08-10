var Q = require("q");

module.exports = deepResolve = function(val,toJSON){
    var queue = [];

    toJSON = toJSON || false;

    if (val && val.toJSON && toJSON){
        return Q(val.toJSON());
    }
    else if (val && val.constructor == Array){
        val.forEach(function(v,i){
            queue.push(resolveChild(val,v,i,toJSON));
        });
    }
    else if (val && val.constructor == Object){
        for (var k in val){
            queue.push(resolveChild(val,val[k],k,toJSON));
        }
    }

    return Q.all(queue).then(function(){
        return val;
    });
}

function resolveChild(val,v,i,toJSON){
    var result = true;

    if (Q.isPromise(v)){
        result = v.then(function(resolvedval){
            if (toJSON && resolvedval && resolvedval.toJSON)
                val[i] = resolvedval.toJSON();
            else
                val[i] = resolvedval;

            if (val[i] && (val[i].constructor==Array || val[i].constructor==Object))
                return deepResolve(val[i],toJSON);
            else
                return true;
        });
    }
    else if (v && (v.constructor==Array || v.constructor==Object)){
        result = deepResolve(v,toJSON);
    }
    else if (v && v.toJSON && toJSON){
        val[i] = v.toJSON();
    }

    return result;
}