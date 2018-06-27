var qs = require('qs')

function decode (uri, urnScheme) {
    urnScheme = urnScheme || 'ethereum'
    var exp = new RegExp('^' + urnScheme + ':(pay-)?(0x[\\w]{40})\\@?([\\w]*)*\\/?([\\w]*)*')
    var data = uri.match(exp)

    if(!data) {
        throw new Error('Invalid BIP681 URI: ' + uri)
    }

    var parameters = uri.split('?');
    parameters = parameters.length > 1 ? parameters[1] : '';

    var obj = {
        urnScheme: urnScheme,
        hasPayTag: !!data[1],
        target_address: data[2],
        chain_id: data[3],
        function_name: data[4],
        parameters: qs.parse(parameters),
    }

    // 判断金额
    var key = obj.function_name === 'transfer' ? 'uint256' : 'value';

    if(obj.parameters[key]) {
        obj.parameters[key] = Number(obj.parameters[key]);
        if (!isFinite(obj.parameters[key])) throw new Error('Invalid amount')
        if (obj.parameters[key] < 0) throw new Error('Invalid amount')
    }
    return obj;
}

function encode (contract, parameters, options, urnScheme) {
    var scheme = urnScheme || 'ethereum';
    var address = contract
    options = options || {};
    parameters = parameters || {};
    var function_name = options.function_name ? '\/' + options.function_name : '';
    var chain_id = options.chain_id ? '@' + options.chain_id : '';
    var payTag = options.hasPayTag ? 'pay-' : '';

    if(!contract) {
        address = parameters.address
        delete parameters.address
    } 

    var query = qs.stringify(parameters)
    var key = options.function_name === 'transfer' ? 'uint256' : 'value';

    if(parameters[key]) {
        parameters[key] = Number(parameters[key]);
        if (!isFinite(parameters[key])) throw new Error('Invalid amount')
        if (parameters[key] < 0) throw new Error('Invalid amount')
    }
    
  return scheme + ':' 
    + payTag 
    + address 
    + chain_id
    + function_name
    + (query ? '?' + query : '')
}

module.exports = {
  decode: decode,
  encode: encode
}