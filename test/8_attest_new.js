var AttestStorage=artifacts.require("./AttestStorage.sol");
var Attestation=artifacts.require("./Attestation.sol");
contract("NEW attestation",function(accounts){
    var storageInstance;
    var attestInstance;
        before(function(){
            Attestation.deployed().then(function(instance){
               // console.log(instance.address);
                attestInstance=instance;
                return AttestStorage.deployed();
            }).then(function(instance2){
                storageInstance=instance2;
            })
        });
        it("should give access to the attest contract and set a new claim",function(){
            return storageInstance.allowAccess(attestInstance.address,{from:accounts[0]}).then(function(ins){
                return attestInstance.setClaim("u1","r1","intern at springrole",{from:accounts[0]});
            }).then(res=>{
                //console.log(res);
            })
          });
        it("should throw error when user tries to attest his own claim",function(){
            return attestInstance.attesting("u1","u1","r1",4).then(function(res){
                assert.isUndefined(res,"throws an error");
            }).catch(err=>{
                assert.isDefined(err,"throws an error");
            });
        })
        it("another user should be able to attest",function(){
            return attestInstance.attesting("u1","u2","r1",4).then(function(res){
                assert.isDefined(res,"another user should be able to attest");
            }).catch(err=>{
                assert.isUndefined(err,"another user should be able to attest");
            });
        })
        it("should throw error when wrong reference is attested",function(){
            return attestInstance.attesting("u1","u2","r8",4).then(function(res){
                assert.isUndefined(res,"error");
            }).catch(err=>{
                assert.isDefined(err,"error");
            });
        })
        it("should be able to get pagination results",function(){
            return attestInstance.getAttestResults.call(1,"r1").then((res)=>{
                  assert.equal("intern at springrole",res[4],"they are equal");
            })
        })
         it("should be able to update claim and level should become zero",function(){
            return attestInstance.updateAttribute("u1","r1","work").then(function(res){
                return attestInstance.attesting("u1","u2","r1",0)
            }).then(res2=>{
                return attestInstance.getAttestResults.call(2,"r1");
            }).then(ans=>{
                console.log(ans);
                assert.equal("work",ans[4],"equal");
                assert.equal(0,ans[2].toNumber());
            });
         });
        });