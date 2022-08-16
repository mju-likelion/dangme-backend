import express from "express";
import { verifyToken } from "../auth/token";
import { Service } from '../../models';
import { Reserve } from '../../models';
import { Shop } from '../../models';
import { Pet } from '../../models';
import { Order } from '../../models';

const router = express.Router();

// 예약 - 애견 서비스 저장 (데모데이터 운용)
router.post("/service/:shopId", async (req, res) => {

    const serviceName = req.body.serviceName;
    const amount = req.body.amount;
    const { shopId } = req.params;

    const shopIdCheck = await Shop.findAll({
        where:{
            id : shopId
        }
    });

    if(shopIdCheck.length != 0) {
        const newService = await Service.create({
            shopId : shopId,
            serviceName : serviceName,
            amount : amount
        });
        return res.json({
            data : "서비스가 추가되었습니다."
        });
    }
});

// 예약 - 예약 불가능날짜/시간 저장 (데모데이터 운용) (규칙사용)
router.post("/date/:shopId", async (req, res) => {

    const noDate = req.body.noDate;
    const { shopId } = req.params;

    const shopIdCheck = await Shop.findAll({
        where:{
            id : shopId
        }
    });

    if(shopIdCheck.length != 0) {
        const newNoReserveDate = await Reserve.create({
            shopId : shopId,
            noDate : noDate
        });
        return res.json({
            data : "예약 불가능 정보가 추가되었습니다."
        });
    }
});

// 예약 - 예약하기 FLOW 관련 전체노출
router.get("/:shopId", async (req, res) => {

    const { shopId } = req.params;

    const serviceList = await Service.findAll({
        attributes : ["serviceName", "amount"],
        where:{
            shopId : shopId
        }
    });

    const reserveList = await Reserve.findAll({
        attributes : ["noDate"],
        where:{
            shopId : shopId
        }
    });

    if(serviceList.length != 0) {
        if (reserveList == undefined) {
            return res.json({
                service : serviceList,
                noDate : null
            });
        }
        return res.json({
            service : serviceList,
            noDate : reserveList
        });
    }
});

// 예약 - 예약내역 저장
router.post("/:shopId/:petId", verifyToken, async (req, res) => {
    
    const userId = req.decoded.id;
    const { shopId } = req.params;
    const { petId } = req.params;
    const orderDate = req.body.orderDate;
    const serviceName = req.body.serviceName;
    const amount = req.body.amount;

    const petIdCheck = await Pet.findAll({
        where:{
            userId : userId
        }
    });

    const shopIdCheck = await Shop.findAll({
        where:{
            id : shopId
        }
    });

    if(petIdCheck.length != 0) {
        if(shopIdCheck.length != 0) {
            const reserveIdCheck = await Reserve.findAll({
                where:{
                    shopId : shopId
                }
            });
            if(reserveIdCheck.length != 0) {
                
                const newOrder = await Order.create({
                    userId : userId,
                    orderDate : orderDate,
                    petId : parseInt(petId),
                    petName : parseInt(petId),
                    shopId : shopId,
                    shopName : shopIdCheck[0].shopName,
                    serviceName : serviceName,
                    amount : amount
                });
                return res.json({
                    data : "예약 완료"
                });
            }
        }
        return res.status(409).json({
            error : "해당 지점 존재하지 않습니다."
        });
    }
    return res.status(409).json({
        error : "해당 강아지가 존재하지 않습니다."
    });
});

// 예약 - 시간노출
// router.get("/:shopId/:petId", verifyToken, async (req, res) => {
    
//     const userId = req.decoded.id;
//     const { shopId } = req.params;
//     const { petId } = req.params;

//     const petIdCheck = await Pet.findAll({
//         where:{
//             userId : userId
//         }
//     });

//     const shopIdCheck = await Shop.findAll({
//         where:{
//             id : shopId
//         }
//     });

//     if(petIdCheck.length != 0) {
//         if(shopIdCheck.length != 0) {
//             const reserveIdCheck = await Reserve.findAll({
//                 where:{
//                     shopId : shopId
//                 }
//             });

//             if(reserveIdCheck.length != 0) {
                
//                 const newOrder = await Order.create({
//                     userId : userId,
//                     orderDate : orderDate,
//                     petId : parseInt(petId),
//                     petName : parseInt(petId),
//                     shopId : shopId,
//                     shopName : shopIdCheck[0].shopName,
//                     serviceName : serviceName,
//                     amount : amount
//                 });
//                 return res.json({
//                     data : "예약 완료"
//                 });
//             }
//         }
        
//         return res.status(409).json({
//             error : "해당 지점 존재하지 않습니다."
//         });
//     }

//     return res.status(409).json({
//         error : "해당 강아지가 존재하지 않습니다."
//     });
// });

// 예약 - 예약내역 노출
router.get("/", verifyToken, async (req, res) => {

    const userId = req.decoded.id;

    const orderListCheck = await Order.findAll({
        where:{
            userId : userId
        }
    });
    if(orderListCheck.length != 0) {
        return res.json({
            data : orderListCheck
        });
    }
});

export default router;