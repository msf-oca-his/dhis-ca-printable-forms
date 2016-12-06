describe("Calculated Config", function() {
	var calculatedConfig;
	var httpMock;
	var config;
	beforeEach(function() {
		module("TallySheets");
		
		config = {
			PageTypes:{
				A4:{
					Portrait:{
						height:100,
						borderBottom:30,
						borderTop:10,
						width:100,
						borderLeft:20,
						borderRight:10
					}
				}
			},
			DataSet:{
				pageHeaderHeight:10
			}
		};
		
		inject(function(CalculatedConfig, $httpBackend) {
			calculatedConfig = CalculatedConfig;
			httpMock = $httpBackend;
			httpMock.expectGET("i18n/en.json").respond(200, {});
		});
	});

	describe("update a4 page calculations", function() {
		it("calculating height and width after removing default borders", function() {
			var actualConfig = calculatedConfig.getConfig(config);
			expect(actualConfig.PageTypes.A4.Portrait.heightAfterRemovingDefaultBorders).toEqual(60);
			expect(actualConfig.PageTypes.A4.Portrait.widthAfterRemovingDefaultBorders).toEqual(70);
		});
		
		it("calculating dataset height and width", function() {
			var actualConfig = calculatedConfig.getConfig(config);
			expect(actualConfig.DataSet.availableHeight).toEqual(50);
			expect(actualConfig.DataSet.availableWidth).toEqual(70);
			
		})
	});
});