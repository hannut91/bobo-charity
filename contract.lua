mylib = require "mylib"

------------------------------------------------------------------------------------

_G.Config={
    -- the standard waykichain contract, if you do not understand the waykichain stardard, please do not change it. Just use the defualt. 
    standard = "WRC20",

    -- the contract owner address, please update it with the actual contract owner address. 
    owner = "wPUcDLC5X6dPaSpwLpbWA9d3BhDtxyEPz1",

    -- the contract name, please update it with the actual contract name.
    name = "BoBoCoin",

    -- the contract symbol, please update it with the actual contract symbol.
    symbol = "BOBO",

    -- the number of decimals the token uses must be 8.
    -- means to divide the token amount by 100000000 to get its user representation.
    decimals = 8,

    -- the contract coin total supply, please update it with the actual contract symbol.
    -- note: the Maximum issued totalSupply is 90000000000 * 100000000
    totalSupply = 210000000 * 100000000
}

------------------------------------------------------------------------------------

-- internal method and table
_G.LibHelp={
    StandardKey={
        standard = "standard",
        owner = "owner",
        name = "name",
        symbol = "symbol",
        decimals = "decimals",
        totalSupply = "totalSupply",
    },
    OP_TYPE = {
        ADD_FREE = 1,
        SUB_FREE = 2
    },
    ADDR_TYPE = {
        REGID  = 1,
        BASE58 = 2
    },
    TableIsNotEmpty = function (t)
        return _G.next(t) ~= nil
    end,
    Unpack = function (t,i)
        i = i or 1
        if t[i] then
          return t[i], _G.LibHelp.Unpack(t,i+1)
        end
    end,
    LogMsg = function (msg)
        local logTable = {
             key = 0,
             length = string.len(msg),
             value = msg
       }
       _G.mylib.LogPrint(logTable)
    end,
    GetContractValue = function (key)
        assert(#key > 0, "Key is empty")
        local tValue = { _G.mylib.ReadData(key) }
        if _G.LibHelp.TableIsNotEmpty(tValue) then
          return true,tValue
        else
            _G.LibHelp.LogMsg("Key not exist")
          return false,nil
        end
    end,
    GetContractTxParam = function (startIndex, length)
        assert(startIndex > 0, "GetContractTxParam start error(<=0).")
        assert(length > 0, "GetContractTxParam length error(<=0).")
        assert(startIndex+length-1 <= #_G.contract, "GetContractTxParam length ".. length .." exceeds limit: " .. #_G.contract)
        local newTbl = {}
        for i = 1,length do
          newTbl[i] = _G.contract[startIndex+i-1]
        end
        return newTbl
    end,
    WriteAppData = function (opType, moneyTbl, userIdTbl)
        local appOperateTbl = {
          operatorType = opType,
          outHeight = 0,
          moneyTbl = moneyTbl,
          userIdLen = #userIdTbl,
          userIdTbl = userIdTbl,
          fundTagLen = 0,
          fundTagTbl = {}
        }
        assert(_G.mylib.WriteOutAppOperate(appOperateTbl), "WriteAppData: ".. opType .." op err")
    end,
    GetFreeTokenCount = function (accountTbl)
        local freeMoneyTbl = { _G.mylib.GetUserAppAccValue( {idLen = #accountTbl, idValueTbl = accountTbl} ) }
        assert(_G.LibHelp.TableIsNotEmpty(freeMoneyTbl), "GetUserAppAccValue error")
        return _G.mylib.ByteToInteger(_G.LibHelp.Unpack(freeMoneyTbl))
    end,
    TransferToken = function (fromAddrTbl, toAddrTbl, moneyTbl, message)
        local money = _G.mylib.ByteToInteger(_G.LibHelp.Unpack(moneyTbl))
        assert(money > 0, money .. " <=0 error")
        local freeMoney = _G.LibHelp.GetFreeTokenCount(fromAddrTbl)
        assert(freeMoney >= money, "Insufficient money to transfer in the account.")

        _G.LibHelp.WriteAppData(_G.LibHelp.OP_TYPE.SUB_FREE, moneyTbl, fromAddrTbl)
        _G.LibHelp.WriteAppData(_G.LibHelp.OP_TYPE.ADD_FREE, moneyTbl, toAddrTbl)
        local result = {mylib.GetCurTxHash()}

        local tx = Serialize(result, true)
        
        local writeTbl = {
            key = tx,
            length = #message,
            value = {}
        }
        writeTbl.value = message
         if not mylib.WriteData(writeTbl) then  error("WriteData error") end
    end,
    GetCurrTxAccountAddress = function ()
        return {_G.mylib.GetBase58Addr(_G.mylib.GetCurTxAccount())}
    end
}



-- contract method for caller
_G.ICO={
    TX_TYPE =
    {
      CONFIG = 0x11,
      SEND_ASSET = 0x16,
    },
    Transfer=function (toTbl,valueTbl,message)
        local base58Addr = _G.LibHelp.GetCurrTxAccountAddress()
        assert(_G.LibHelp.TableIsNotEmpty(base58Addr),"GetBase58Addr error")

        _G.LibHelp.TransferToken(base58Addr, toTbl, valueTbl, message)
    end,
    Config=function ()
        -- check contract statu
        assert(_G.LibHelp.GetContractValue("name")==false,"Already configured")

        -- write down standard key
        for k,v in pairs(_G.LibHelp.StandardKey) do
            if _G.Config[k] then
                local value = {}
                if type(_G.Config[k]) ==  "number" then
                    value = {_G.mylib.IntegerToByte8(_G.Config[k])}
                else
                    value = {string.byte(_G.Config[k],1,string.len(_G.Config[k])) }
                end
                local writOwnerTbl = {
                    key = v,
                    length = #value,
                    value = value
                }
                assert(_G.mylib.WriteData(writOwnerTbl),'can not issue tokens, failed to write the key='..v..' value='.._G.Config[k])
            else
                error('can not issue tokens, failed to read the key='..k)
            end
        end

        -- issue tokens
        local totalSupplyTbl =  {_G.mylib.IntegerToByte8(_G.Config.totalSupply)}
        _G.LibHelp.WriteAppData(_G.LibHelp.OP_TYPE.ADD_FREE, totalSupplyTbl,{string.byte(_G.Config.owner,1,string.len(_G.Config.owner))})
        _G.LibHelp.LogMsg("contract config success, name: ".._G.Config.name.."issuer: ".._G.Config.owner)
      end
}

Serialize = function(obj, hex)
    local lua = ""
    local t = type(obj)

    if t == "table" then
        for i=1, #obj do
            if hex == false then
                lua = lua .. string.format("%c",obj[i])
            elseif hex == true then
                lua = lua .. string.format("%02x",obj[i])
      else
        error("index type error.")  
            end
        end
    elseif t == "nil" then
        return nil
    else
        error("can not Serialize a " .. t .. " type.")
    end

    return lua
end

------------------------------------------------------------------------------------

assert(   #_G.contract    >=4, "Parameter length error (<4): " ..#_G.contract)
assert(_G.contract[1] == 0xf0, "Parameter MagicNo error (~=0xf0): " .. _G.contract[1])

if _G.contract[2] == _G.ICO.TX_TYPE.CONFIG then
    _G.ICO.Config()
elseif _G.contract[2] == _G.ICO.TX_TYPE.SEND_ASSET then
    local pos = 5
    local toTbl = _G.LibHelp.GetContractTxParam(pos, 34)
    pos = pos + 34
    local valueTbl = _G.LibHelp.GetContractTxParam(pos, 8)
    pos = pos + 8
    local message =  _G.LibHelp.GetContractTxParam(pos, #_G.contract - pos)
    _G.ICO.Transfer(toTbl,valueTbl,message)
else
    error(string.format("Method %02x not found or parameter error", _G.contract[2]))
end
