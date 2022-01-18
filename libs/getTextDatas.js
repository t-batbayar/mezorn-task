const getTextDatas = (textsArr) => {
    const familyName = textsArr[textsArr.indexOf('Овог Family name') + 1]
    const familyNameEng = textsArr[textsArr.indexOf('Овог Family name') + 2]

    const lastname = textsArr[textsArr.indexOf('Эцэг/эх/-ийн нэр Surname') + 1]
    const lastnameEng = textsArr[textsArr.indexOf('Эцэг/эх/-ийн нэр Surname') + 2]

    const firstname = textsArr[textsArr.indexOf('Нэр Given name') + 1]
    const firstnameEng = textsArr[textsArr.indexOf('Нэр Given name') + 2]

    const registrationNumber = textsArr[textsArr.indexOf('Регистрийн дугаар Registration number') + 1]

    const registrationNumberMn = registrationNumber.split('/')[0]
    const registrationNumberEn = registrationNumber.split('/')[1]

    const dataObj =  {
        familyName, familyNameEng, lastname, lastnameEng, firstname, firstnameEng, registrationNumberMn, registrationNumberEn
    }

    for (const key in dataObj) {
        dataObj[key] = dataObj[key]?.trim()
    }

    return dataObj
}

module.exports = getTextDatas