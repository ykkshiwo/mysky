var app = getApp()
var util = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: { 
    thoughts: [],
    lat: null,
    long: null,
    content: '',
    test: '',
    num: 0,
    animationData: {},
    text: "没有滑动",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    if(app.globalData.is_from_fabiao){
      console.log("是从发表页面切换回来的，不去获得的此地的经纬度")
      var t = wx.getStorageSync("all_thoughts")
      this.setData({
        thoughts: t,
      })
    }
    else{
      if (app.globalData.c_lat && app.globalData.c_long) {
        console.log("已经有要获取的地点的经纬度：", app.globalData.c_lat, app.globalData.c_long)
        this.thoughtsHere(app.globalData.c_lat, app.globalData.c_long)
      }
      else {
        wx.getLocation({
          type: 'wgs84',
          success: function (res) {
            app.globalData.c_lat = res.latitude
            app.globalData.c_long = res.longitude
            console.log("需要获取地点的经纬度：", app.globalData.c_lat, app.globalData.c_long)
            that.thoughtsHere(app.globalData.c_lat, app.globalData.c_long)
          }
        })
      }  //每次显示，将小程序切换到后台后回来也要获得地理位置，看改变了没有
    }
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.is_from_fabiao = false;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  //  查询此地点附近所有的蒲公英，并且数据替换
  thoughtsHere: function(lat, long){
    var that = this
    wx.request({
      url: "https://www.kkykykk.xyz/thoughtsHere",
      method: "PUT",
      data: {
        lat: lat,
        long: long,
      },
      dataType: "json",
      header: {
        "Content-Type": 'application/json'
      },
      success: function(res){
        var all_thoughts = res.data  //从服务器返回的此地点的所有蒲公英
        console.log("服务器返回此地的所有的蒲公英： ", all_thoughts)
        all_thoughts = that.thoughtsTime(all_thoughts)
        wx.setStorageSync("all_thoughts", all_thoughts)
        that.setData({
          thoughts: all_thoughts,
        })
      }
    })
  },

  thoughtsTime(thoughts){
    var thoughts_long = thoughts.length
    for(var i=0; i<thoughts_long; i++){
      thoughts[i].createtime_t = util.getDiffTime(thoughts[i].createtime_t, true)
    }
    return thoughts;
  },


  toFabiao: function(){
    wx.redirectTo({
      url: '../fabiao/fabiao',
      success: function(){
        console.log("进入发表页面")
      }
    })
  },

  jiaoZhun(){
    var that = this
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        app.globalData.c_lat = res.latitude
        app.globalData.c_long = res.longitude
        console.log("校准前系统监测的经纬度：", app.globalData.c_lat, app.globalData.c_long)
        that.jiaoZhunKaiShi()
      }
    })
  },

  jiaoZhunKaiShi(){
    var that = this
    wx.chooseLocation({
      success: function (res) {
        console.log("校准时的经纬度为：", res.latitude, res.longitude)
        var lat_c = res.latitude - app.globalData.c_lat
        var long_c = res.longitude - app.globalData.c_long
        console.log("维度差：", lat_c)
        console.log("经度差:", long_c)
        if (Math.abs(lat_c) > 0.02 || Math.abs(long_c) > 0.02) {
          console.log("系统侦测的位置与校准的出入较大")
          wx.showModal({
            title: '校准失败',
            content: '系统监测到您的实际位置与您提交的校准位置出入较大，请点击确定重新校准，或返回主页面',
            cancelText: '返回主页',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                that.jiaoZhun()
              } else if (res.cancel) {
                console.log('用户点击取消')
                wx.redirectTo({
                  url: '../welcome/welcome',
                  success: function () {
                    console.log("成功跳转回主显示页")
                  }
                })
              }
            }
          })
        }
        else {
          app.globalData.c_lat = res.latitude
          app.globalData.c_long = res.longitude
          console.log("校准后的经纬度为：", res.latitude, res.longitude)
          app.globalData.have_jiaozhun = true
          console.log("have_jiaoazhun的值为：", app.globalData.have_jiaozhun)
        }
      },
    })
  },
  
  handletouchmove: function (event) {
    console.log(event)
    let currentX = event.touches[0].pageX
    let currentY = event.touches[0].pageY

    console.log(currentY)
    console.log(this.data.lastY)
    let text = ""
    if ((currentY - this.data.lastY) < 0) {
      text = "向上滑动"
      this.translatey()
    }
    else if (((currentY - this.data.lastY) > 0)) {
      text = "向下滑动"
      this.translatez()
    }
    //将当前坐标进行保存以进行下一次计算
    this.data.lastX = currentX
    this.data.lastY = currentY
    this.setData({
      text: text,
    });
  },

  handletouchtart: function (event) {
    console.log(event)
    this.data.lastX = event.touches[0].pageX
    this.data.lastY = event.touches[0].pageY
  },

  handletap: function (event) {
    console.log(event)
  },

  translatey: function () {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'linear',
    })

    animation.opacity(0.2).step()

    this.setData({
      animationData: animation.export()
    })
  },

  translatez: function () {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear',
    })

    animation.opacity(1).step()

    this.setData({
      animationData: animation.export()
    })
  },

})