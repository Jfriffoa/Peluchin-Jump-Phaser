class Utils {
    /**
     * Scale sprites as need it
     * from http://netexl.com/blog/making-of-a-responsive-game-in-phaser-part-2/
     * @param {Phaser.GameObject.Image} sprite 
     * @param {number} availableWidth 
     * @param {number} availableHeight 
     * @param {number} padding 
     * @param {number} scaleMultiplier 
     */
    static scaleSprite(sprite, availableWidth, availableHeight, padding, scaleMultiplier){
        var scale = this.getSpriteScale(sprite.width, sprite.height, availableWidth, availableHeight, padding);
		sprite.setScale(scale * scaleMultiplier);
    }

    /**
     * Get the scale needed for the resizing
     * from http://netexl.com/blog/making-of-a-responsive-game-in-phaser-part-2/
     * @param {number} spriteWidth 
     * @param {number} spriteHeight 
     * @param {number} availableWidth 
     * @param {number} availableHeight 
     * @param {number} minPadding 
     */
    static getSpriteScale(spriteWidth, spriteHeight, availableWidth, availableHeight, minPadding){
        let ratio = 1;
        let currentDevicePixelRatio = window.devicePixelRatio;

        // fit height or width
        var widthRatio = (spriteWidth * currentDevicePixelRatio + 2 * minPadding) / availableWidth;
		var heightRatio = (spriteHeight * currentDevicePixelRatio + 2 * minPadding) / availableHeight;
        
        if (widthRatio > 1 || heightRatio > 1) {
			ratio = 1 / Math.max(widthRatio, heightRatio);
        } 
        
		return ratio * currentDevicePixelRatio;	
    }
}