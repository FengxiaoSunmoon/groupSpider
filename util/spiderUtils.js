const path = require('path')
const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const Article = require('../app/models/Article.coffee')

//配置文件示例
// let pageArg = {
//   url: netUrl, //网址
//   ele: '#menu li a',  //要获取的元素
//   out: ['首页','工作组介绍'], //排除标签,可选
//   scroll: true, //是否需要滚动到页面底部
//   waitEle: '#menu li a',  //等待元素被加载
//   //返回值
//   res:{
//     href: true,
//     text: true,
//     html: true,
//     value: true,
//     src: true   //图片
//   }
// }
//获取页面信息
const gopage = async (browser,arg) => {
  let page = await browser.newPage();
  await page.goto(arg.url,{timeout:0});
  //注入代码，滚动条滑到底部
  if(arg.scroll){
    let scrollEnable = true;
    let scrollStep = 500; //每次滚动的步长
    while (scrollEnable) {
      scrollEnable = await page.evaluate((scrollStep) => {
        let scrollTop = document.scrollingElement.scrollTop;
        document.scrollingElement.scrollTop = scrollTop + scrollStep;
        return document.body.clientHeight > scrollTop + 1080 ? true : false
      }, scrollStep);
      await page.waitFor(100);
    }
  }
  if(arg.waitEle){
    await page.waitForSelector(arg.waitEle); //等待元素加载之后，否则获取不到异步加载的元素
  }
  let data = await returnPageInfo(page,arg);
  return data
}
exports.gopage = gopage;
//返回页面信息
const returnPageInfo = async (page,arg) => {
  let data = await page.evaluate((arg) => {
    let list = [...document.querySelectorAll(arg.ele)]
    return list.map(el => {
      if( !arg.out || arg.out.indexOf(el.innerText) < 0){
        let result = {};
        result.cate = arg.res.cate;
        if(arg.res.href){
          result.href = el.href.trim();
        }
        if(arg.res.text){
          result.text = el.innerText;
        }
        if(arg.res.html){
          result.html = el.outerHTML;
        }
        if(arg.res.value){
          result.value = el.value;
        }
        if(arg.res.src){
          result.src = el.src;
        }
        return result;
      }
    })
  },arg)
  //await page.click('#su');
  return data
}
//配置文件示例
// let gopagesConf = {
//   url: netUrl, //入口网址
//   scroll: true, //是否需要滚动到页面底部
//   eleContainer: [
//     {
//       ele: '.jianyao',  //要获取的元素
//       //返回值
//       res:{
//         text: true
//       }
//     },
//     {
//       ele: '.zyneirong p',  //要获取的元素
//       //返回值
//       res:{
//         href: true
//       }
//     }
//   ]
// }
//获取页面多个信息
const gopages = async (browser,arg) => {
  let page = await browser.newPage();
  await page.goto(arg.url,{timeout:0});
  //注入代码，滚动条滑到底部
  if(arg.scroll){
    let scrollEnable = true;
    let scrollStep = 500; //每次滚动的步长
    while (scrollEnable) {
      scrollEnable = await page.evaluate((scrollStep) => {
        let scrollTop = document.scrollingElement.scrollTop;
        document.scrollingElement.scrollTop = scrollTop + scrollStep;
        return document.body.clientHeight > scrollTop + 1080 ? true : false
      }, scrollStep);
      await page.waitFor(100);
    }
  }
  if(arg.waitEle){
    await page.waitForSelector(arg.waitEle); //等待元素加载之后，否则获取不到异步加载的元素
  }
  let data = [];
  for(let i=0;i<arg.eleContainer.length;i++){
    data[i] = await returnPageInfo(page,arg.eleContainer[i]);
  }
  //console.log(data);
  return data
}
exports.gopages = gopages;
//配置文件示例
// let pageNext = {
//   url: netUrl, //网址
//   ele: '.pagelist a.n',  //元素
//   eleText: '下一页',
//   scroll: true, //是否需要滚动到页面底部
//   //返回值
//   res:{
//     href: true
//   }
// }
//获取下一页的链接
const nexthref = async (browser,arg) => {
  let page = await browser.newPage();
  await page.goto(arg.url,{timeout:0});
  //注入代码，滚动条滑到底部
  if(arg.scroll){
    let scrollEnable = true;
    let scrollStep = 500; //每次滚动的步长
    while (scrollEnable) {
      scrollEnable = await page.evaluate((scrollStep) => {
        let scrollTop = document.scrollingElement.scrollTop;
        document.scrollingElement.scrollTop = scrollTop + scrollStep;
        return document.body.clientHeight > scrollTop + 1080 ? true : false
      }, scrollStep);
      await page.waitFor(100);
    }
  }
  if(arg.waitEle){
    await page.waitForSelector(arg.waitEle); //等待元素加载之后，否则获取不到异步加载的元素
  }
  let data = await page.evaluate((arg) => {
    let result;
    //判断是否有搜索内容限制
    if(arg.eleText){
      let lists = [...document.querySelectorAll(arg.ele)]
      for(var li of lists){
        if(li && li.innerText == arg.eleText) result = li.href.trim();
      }
    }else {
      let list = document.querySelector(arg.ele)
      if(list){
        result = list.href.trim();
      }
    }
    return result;
  },arg)

  return data
}
exports.nexthref = nexthref;
//取得下一页
exports.getNextHref = async (browser,pageNowConf,intoPageConf,pageNextConf) => {
  let next = pageNowConf.url
  while (next) {
    console.log('主页面：' + next);
    //获取当前页面内容
    pageNowConf.url = next;
    results = await gopage(browser,pageNowConf)
    //console.log(results);
    for(let res of results){
      intoPageConf.url = res.href;
      console.log("子页面：" + res.href);
      try {
        let pageInfos = await gopage(browser,intoPageConf)
        //console.log(pageInfos);
        let analyArg = {
          ele: 'p',//元素
          //返回值
          res:{
            text: true,
            img: true
          }
        }
        res.cate = intoPageConf.cate;
        res.content = analy(pageInfos,analyArg)
        //console.log("analyRes:",res);
        saveMongo(res) //保存数据库
      } catch (e) {
        console.log('链接不存在。');
      }
    }
    //获取下一页链接
    pageNextConf.url = next;
    next = await nexthref(browser,pageNextConf)
  }
}
//配置文件示例
// let analyArg = {
//   ele: 'p',//元素
//   //返回值
//   res:{
//     text: true,
//     img: true,
//     href: true,
//   }
// }
//分析
const analy = (htmls,arg) => {
  if(htmls){
    let res = htmls.map(el => {
      let $ = cheerio.load(el.html)
      let result = {};
      if(arg.res.href){
        result.href = $(arg.ele).attr('href');
      }
      if(arg.res.img){
        let imgTag = $(arg.ele + ' img').attr('src')
        if(imgTag){
          if(imgTag.indexOf('www.') < 0 && imgTag.indexOf('http') < 0){
            //加网址前缀
            result.img = 'http://www.chinadcc.org/' + imgTag
          }else {
            result.img = imgTag;
          }
          try {
            let format = imgTag.slice(-3) == 'png'?'.png':'.jpg';
            let len = Math.floor(imgTag.length / 2)
            result.imgLocal = imgTag.slice(-len).replace(/[\/\.]/g,'') + format; //替换掉路径字符
          } catch (e) {
            console.log('imgLocal false');
          }
        }
      }
      if(arg.res.text){
        result.text = $(arg.ele).text().trim();
      }
      return result;
    })
    //剔除空标签
    let r = [];
    for(let info of res){
      if(info.text || info.img){
        r.push(info);
      }
    }
    return r;
  }
}
exports.analy = analy;
//存数据库
const saveMongo = (result) => {
  if(!result.content.length) return;
  Article.findOne({text:result.text},(err,s) => {
    if(s){
      console.log('数据库已存在这篇文章');
    }else{
      //下载图片
      result.content.forEach((p) => {
        if(p.img){
          let saveImgPath = path.join(__dirname,'../src/img/article',p.imgLocal);
          try {
            downImg(p.img,saveImgPath)
          } catch (e) {
            console.log('下载图片错误:' + p.img);
          }
        }
      })
      //保存数据
      let art = new Article(result);
      art.save((err,flag) => {
        if(err){
          console.log(err);
        }else {
          console.log('文章已保存');
        }
      })
    }
  })
}
exports.saveMongo = saveMongo;
//图片下载
const downImg = (src, dest) => {
  var options = {
    url: src,
    headers: {
     'Connection':'keep-alive',  //保持连接，否则可能报错
     'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36'
    }
  };
  request(options).pipe(fs.createWriteStream(dest)).on('close',function(){
    console.log('图片已保存！',src)
  })
}
exports.downImg = downImg;
