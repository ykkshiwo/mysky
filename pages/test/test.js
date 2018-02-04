Page({
  data: {
    lastX: 0,
    lastY: 0,
    text: "没有滑动",
    animationData: {},
  },
  handletouchmove: function (event) {
    console.log(event)
    let currentX = event.touches[0].pageX
    let currentY = event.touches[0].pageY

    console.log(currentY)
    console.log(this.data.lastY)
    let text = ""
    if ((currentY - this.data.lastY) < 0){
      text = "向上滑动"
      this.translatey()
    }
    else if (((currentY - this.data.lastY) > 0)){
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

  translatey:function(){
    var animation = wx.createAnimation({
      duration: 1000,
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
      timingFunction: 'ease',
    })

    animation.opacity(0.8).step()

    this.setData({
      animationData: animation.export()
    })
  },

})