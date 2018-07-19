var skillStorage=artifacts.require("./SkillStorage.sol");
var skillAdder=artifacts.require("./SkillAdder.sol");
contract("NEW skillAdder",function(accounts){
    var skillstorageInstance;
    var skillInstance;
        before(function(){
            skillAdder.deployed().then(function(instance){
               // console.log(instance.address);
                skillInstance=instance;
                return skillStorage.deployed();
            }).then(function(instance2){
                skillstorageInstance=instance2;
            })
        });
        it("should give access to the attest contract and set a new claim",function(){
            return skillstorageInstance.allowAccess(skillInstance.address,{from:accounts[0]}).then(function(ins){
                return skillInstance.addSkill("u1","s1","c++",{from:accounts[0]});
            }).then(res=>{
            })
          });
        it("another user should be able to endorse",function(){
            return skillInstance.endorse("s1","u2","c++","u1").then(function(res){
                assert.isDefined(res,"another user should be able to attest");
            }).catch(err=>{
                assert.isUndefined(err,"another user should be able to attest");
            });
        })
        it("should be able to get pagination results",function(){
            return skillInstance.getEndorseResults.call(1,"s1").then((res)=>{
                  assert.equal("c++",res[1],"they are equal");
            })
        })
        it("user cannot endorse two same skills with same refernce id",function(){
            return skillInstance.endorse("s1","u2","c++","u1").then(function(res){
                assert.isUndefined(res,"another user should be able to attest");
            }).catch(err=>{
                assert.isDefined(err,"another user should be able to attest");
            });
        });
        /**
         this test case is for future use
         */

        //  it("should be able to delete skill",function(){
        //     return skillInstance.updateAttribute("u1","r1","work").then(function(res){
        //         return skillInstance.attesting("u1","u2","r1",0)
        //     }).then(res2=>{
        //         return skillInstance.getAttestResults.call(2,"r1");
        //     }).then(ans=>{
        //         console.log(ans);
        //         assert.equal("work",ans[4],"equal");
        //         assert.equal(0,ans[2].toNumber());
        //     });
        //  });
        });