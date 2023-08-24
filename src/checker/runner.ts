const runner = (obj: any, checkList: any[], fn: any) => {
    const securityList = checkList.map(x => {
        if (fn(obj) != undefined) {
            x.status = x.fn(fn(obj));
        }
        return {
          ... x,
          valid: x.status == false,
          value: (x.getValue != undefined ? (fn(obj) != undefined ? x.getValue(fn(obj)) : 'N/A') : undefined)
        };
      });
    const passed = securityList.reduce((acc, x) => acc + (x.valid ? 1 : 0), 0);
    const attention = securityList.reduce((acc, x) => acc + (x.valid ? 0 : 1), 0);
    const passedPercentage = (passed / securityList.length) * 100;

    return {
        securityList: securityList,
        passed: passed,
        attention: attention,
        level: passedPercentage > 95 ? 'High' : passedPercentage > 70 ? 'Medium' : 'Low',
        scanned: fn(obj) != undefined,
        passedPercentage: passedPercentage
    }
};

export {
    runner
};