const puppeteer = require('puppeteer');
const path = require('path');
const Utils = require('./spiderUtils')
//const netUrl = 'http://www.jifang360.com'
const Group = require('../app/models/Group.coffee')
const Jjcont = require('../app/models/Jjcontent.coffee')

module.exports = async (cb) => {
  console.log('spider start: ...');
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors:true,
    headless:true,
    slowMo:250,
    timeout:0,
    //args: ['--no-sandbox', '--disable-setuid-sandbox'], //服务器配置
    //executablePath: '/usr/bin/chromium-browser'  //服务器配置
  });
  // 工作组介绍
  let gopagesConf = {
    url: 'http://www.chinadcc.org/cdcc.html', //工作组介绍
    scroll: true, //是否需要滚动到页面底部
    eleContainer: [
        {
          ele: '.jiegou img',  //要获取的元素
          //返回值
          res:{
            src: true
          }
        },
        {
          ele: '.jiegou a',  //要获取的元素
          //返回值
          res:{
            text: true
          }
        }
      ]
    }
  let groupInfo = await Utils.gopages(browser,gopagesConf)
  // console.log('0:',groupInfo[0]);
  // console.log('1:',groupInfo[1]);
  for(let i=0;i<groupInfo[0].length;i++){
    let info = {};
    info.img = groupInfo[0][i].src;
    let len = Math.floor(info.img.length / 2)
    let format = info.img.slice(-3) == 'png'?'.png':'.jpg';
    info.imgLocal = info.img.slice(-len).replace(/[\/\.]/g,'') + format;
    console.log(info.imgLocal);
    info.text = groupInfo[1][i + 1].text;
    Group.findOne({imgLocal:info.imgLocal},(err,s) => {
      if(s){
        console.log('已保存工作组信息');
      }else{
        //下载图片
        let saveImgPath = path.join(__dirname,'../src/img/group/',info.imgLocal);
        try {
          Utils.downImg(info.img,saveImgPath)
        } catch (e) {
          console.log('下载工作组图片错误:' + info.img);
        }
        //保存数据
        let g = new Group(info);
        g.save((err,flag) => {
          if(err){
            console.log(err);
          }else {
            console.log('工作组信息已保存');
          }
        })
      }
    })
  }
  //------------------------------------------------------------------------------------
  //获取简介
  let jjConf = {
    url: 'http://www.chinadcc.org/cdcc.html', //入口网址
    ele: '.jj_08 .content',  //要获取的元素
    scroll: true, //是否需要滚动到页面底部
    //返回值
    res:{
      cate: 0,
      text: true
    }
  }
  let jjInfos = await Utils.gopage(browser,jjConf)
  //console.log(jjInfos);
  if(jjInfos){
    for(let info of jjInfos){
      Jjcont.findOne({cate:info.cate},(err,s) => {
        if(s){
          s.text = info.text
          s.save((err,flag) => {
            if(err){
              console.log(err);
            }else {
              console.log('已更新简介内容');
            }
          })
        }else{
          let g = new Jjcont(info);
          g.save((err,flag) => {
            if(err){
              console.log(err);
            }else {
              console.log('简介信息已保存');
            }
          })
        }
      })
    }
  }
  //------------------------------------------------------------------------------------
  let pageNowConf = {
    url: 'http://www.chinadcc.org/article/standard/', //入口网址
    ele: '.list a',  //要获取的元素
    scroll: true, //是否需要滚动到页面底部
    //返回值
    res:{
      href: true,
      text: true
    }
  }
  //进入分页配置
  let intoPageConf = {
    ele: '.zyneirong p',  //要获取的元素
    scroll: true, //是否需要滚动到页面底部
    cate: 0, //自定义一个分类
    //返回值
    res:{
      html: true
    }
  }
  //下一页配置
  let pageNextConf = {
    url: 'http://www.chinadcc.org/article/standard/', //入口网址
    ele: '.pagelist a.n',  //元素
    eleText: '下一页',
    scroll: true, //是否需要滚动到页面底部
    //返回值
    res:{
      href: true
    }
  }
  //标准文档
  await Utils.getNextHref(browser,pageNowConf,intoPageConf,pageNextConf);
  //工作组动态
  pageNowConf.url = 'http://www.chinadcc.org/article/cdccnews/';
  intoPageConf.cate = 1;
  await Utils.getNextHref(browser,pageNowConf,intoPageConf,pageNextConf);
  //技术热点
  pageNowConf.url = 'http://www.chinadcc.org/article/tech/';
  intoPageConf.cate = 2;
  await Utils.getNextHref(browser,pageNowConf,intoPageConf,pageNextConf);
  //服务内容介绍
  pageNowConf.url = 'http://www.chinadcc.org/article/content/';
  intoPageConf.cate = 3;
  await Utils.getNextHref(browser,pageNowConf,intoPageConf,pageNextConf);
  //服务动态
  pageNowConf.url = 'http://www.chinadcc.org/article/servicenews/';
  intoPageConf.cate = 4;
  await Utils.getNextHref(browser,pageNowConf,intoPageConf,pageNextConf);
  //项目案例
  pageNowConf.url = 'http://www.chinadcc.org/article/case/';
  intoPageConf.cate = 5;
  await Utils.getNextHref(browser,pageNowConf,intoPageConf,pageNextConf);

  console.log('spider over');
  await browser.close();
  typeof cb == "function" && cb()
}
