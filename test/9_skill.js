var AttestStorage=artifacts.require("./SkillStorage.sol");
var Attestation=artifacts.require("./SkillAdder.sol");
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
                return attestInstance.addSkill("u1","s1","c++",{from:accounts[0]});
            }).then(res=>{
                //console.log(res);
            })
          });
        it("another user should be able to endorse",function(){
            return attestInstance.endorse("s1","u2","c++","u1").then(function(res){
                assert.isDefined(res,"another user should be able to attest");
            }).catch(err=>{
                assert.isUndefined(err,"another user should be able to attest");
            });
        })
        it("should be able to get pagination results",function(){
            return attestInstance.getEndorseResults.call(1,"s1").then((res)=>{
                  assert.equal("c++",res[1],"they are equal");
            })
        })
        //  it("should be able to update claim and level should become zero",function(){
        //     return attestInstance.updateAttribute("u1","r1","work").then(function(res){
        //         return attestInstance.attesting("u1","u2","r1",0)
        //     }).then(res2=>{
        //         return attestInstance.getAttestResults.call(2,"r1");
        //     }).then(ans=>{
        //         console.log(ans);
        //         assert.equal("work",ans[4],"equal");
        //         assert.equal(0,ans[2].toNumber());
        //     });
        //  });
        });