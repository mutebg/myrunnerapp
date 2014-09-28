app.directive('piecircle', function () {
    return {
        restrict: 'E',
        scope: {
            pcurrent: '=',
            pmax: '=',
            pborder: '='
        },
        template: ' <div class="piecircle-wrapper"><div class="piecircle-spinner piecircle-pie"></div><div class="piecircle-filler piecircle-pie"></div><div class="piecircle-mask"></div></div>',
        link: function ($scope, element, attrs) { 
            var divs = element.find('div');
            var wrapper = divs[0];
            var spinner = divs[1];
            var filler = divs[2];
            var mask = divs[3];

            wrapper.borderColor = $scope.pborder;
            
            $scope.$watch('pcurrent', function(value){
                value = parseFloat(value);

                if ( value > $scope.pmax ) {
                    value = $scope.pmax;
                }

                if ( isNaN(value) || value < 0 ) {
                    value = 0;
                }

                var deg = ( value / parseFloat($scope.pmax) ) * 360;
                spinner.style.borderColor = $scope.pborder;
                filler.style.borderColor = $scope.pborder;

                spinner.style.transform =  'rotate(' + deg + 'deg)';
                filler.style.opacity = deg > 180 ? 1 : 0;
                mask.style.opacity = deg < 180 ? 1 : 0;
                
            });
        }            
    }
});