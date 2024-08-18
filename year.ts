<template>
  <div class="Years" @scroll.passive="onScroll" @scrollend.passive="onScrollEnd" ref="container">
      <div class="year" v-for="(year, index) in years" ref="items">
        {{ year }}
      </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Years extends Vue {
  private animationFrameId: number | null = null;
  scrollTimeout: number | null = null;
  years: Array<number> = [];
  yearNow: number = new Date().getFullYear();
  pm: number = 0;
  parent: HTMLElement | null = null;
  isMounted: boolean = false;
  childHeight: number = 50;

  created() {
      for (let i = this.yearNow - 15; i <= this.yearNow + 15; i++) this.years.push(i);
  }
  mounted() {
      const parent = (this.$refs.container as Element);
      parent.scrollTop = (parent.scrollHeight - parent.clientHeight) / 2;
      this.pm = parent.scrollTop;
      this.parent = this.$refs.container as HTMLElement;
      this.isMounted = true;
  }

  onScroll(e: any) {
      if (!this.isMounted) return;
      if (!this.parent) return;
      if (this.animationFrameId !== null) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
      }
      let scrollTop = this.parent.scrollTop;
      const distanceScrolled = scrollTop - this.pm;
      if (Math.abs(distanceScrolled) >= this.childHeight) {
          if (distanceScrolled > 0) {
            this.years.push(this.years[this.years.length - 1] + 1);
            scrollTop -= this.childHeight;
            this.parent.scrollTop = scrollTop;
            this.years.shift();
          } else {
            this.years.unshift(this.years[0] - 1);
            scrollTop += this.childHeight;
            this.parent.scrollTop = scrollTop;
            this.years.pop();
          }
          this.pm = scrollTop;
      }
  }

  onScrollEnd() {
      const childs = this.$refs?.items as Array<Element>;

      const pRect = this.parent!.getBoundingClientRect();
      const parentMiddle = pRect.top + (pRect.height / 2);

      let closest = childs.reduce((prev, curr) => {
          const currRect = curr.getBoundingClientRect();
          const prevRect = prev.getBoundingClientRect();

          const currDistance = Math.abs(currRect.top + (currRect.height / 2) - parentMiddle);
          const prevDistance = Math.abs(prevRect.top + (prevRect.height / 2) - parentMiddle);

          return currDistance < prevDistance ? curr : prev;
      });

      const closestRect = closest.getBoundingClientRect();
      const offset = closestRect.top + (closestRect.height / 2) - parentMiddle;

      this.smoothScroll(this.parent!, offset, 50);
  }

  private smoothScroll(element: HTMLElement, targetOffset: number, duration: number) {

      const start = element.scrollTop;
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);

          // Easing function (ease-in-out)
          const easeInOutQuad = (t: number) =>
              t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

          const easedProgress = easeInOutQuad(progress);

          // Scroll to the calculated position
          element.scrollTop = start + targetOffset * easedProgress;

          // Continue the animation if duration not completed
          if (elapsedTime < duration) {
              this.animationFrameId = requestAnimationFrame(animateScroll);
          } else {
              this.animationFrameId = null;
          }
      };

      this.animationFrameId = requestAnimationFrame(animateScroll);
  }
}
</script>

<style>
.Years { width: 100px; height: 300px; background-color: gray; overflow-y: scroll;}
.Years::-webkit-scrollbar {display: none;}
.year { width: 100%; height: 50px; text-align:center;line-height:50px;color:#fff;}
</style>
