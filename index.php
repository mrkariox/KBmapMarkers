<?php
/**
 * Template part for displaying promet map block
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package Starter_theme
 */

?>

<?php

	$locations = array(

		'Kaer Morhen' => array(
			'coordinates' => array(
				'x' => 54.25,
				'y' => 18.59
			),
			'members' => array(
				'Vesemir' => array(
					'email' => 'vesemir@kaermorhen.pl',
					'tel' => '942 422 144'
				)
			)
		),
		'Wyzima' => array(
			'coordinates' => array(
				'x' => 32.15,
				'y' => 53.34
			),
			'members' => array(
				'Król Foltest' => array(
					'email' => 'foltest@temeria.pl',
					'tel' => '654 342 674'
				)
			)
		),
		'Vengerberg' => array(
			'coordinates' => array(
				'x' => 49.93,
				'y' => 53.93
			),
			'members' => array(
				'Yennefer' => array(
					'email' => 'yen@lozaczarodziejek.pl',
					'tel' => '864 464 743'
				)
			)
		)

	);

	$locationsJSON = json_encode($locations, JSON_UNESCAPED_UNICODE);

?>

<!DOCTYPE html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
		<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
		<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
		<link href="css/style.css" rel="stylesheet">
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
	</head>
	<body>

		<style>

		@font-face {
		  font-family: 'witcher';
		  src: url('thewitcher-4.ttf')  format('truetype')
		}

		.pageSectionHeader, .sectionHeader{
			font-family: witcher;
		}

		.pageSecitonHeader{
			margin-top: 0px;
			font-size: 30px;
			color: #56270c;
		}

		.sectionHeader{
			color: #56270c;
		}

		.prometMapLegend{
			margin-bottom: 30px;
		}

		.prometMapLegend__container{
			background-color: #b88857;
		}

		body, .prometMapLegend{
			background-color: #c89867;
			color: #392c20;
		}

		.mapMarkerCords {
		    position: absolute;
		    bottom: 0px;
		    right: 0px;
		    background-color: #e7b786;
		    border: 2px solid #56270c;
		    padding: 2px 5px;
		    pointer-events: none;
		}

		@media (min-width: 1440px){
			.container {
				width: 1410px;
			}
		}

		</style>

		<div class="container">
			
			<section class="prometMap">
				<h3 class="pageSectionHeader paddingBottom marginBottom paddingTop">
					Gdzie nas znajdziesz
				</h3>

				<div class="prometMap__mapContainer paddingBottom">
					<div class="prometMap__mapHolder">
						<img src="mapa.jpg" alt="mapa">
					</div>
				</div>

				<script type="text/javascript" src="js/mapmarkers.js"></script>
				<script type="text/javascript" src="js/acfmapcoordinates.js"></script>

				<script>

					// JSON with all map data;
					var mapDataJSON = <?php echo $locationsJSON ?>;			

					(function($) {

						// Show all map markers on map
						$(document).ready(function(){ 

							var icon = 'map-marker.svg';

							showAllMapMarkers(icon, '.prometMap__mapHolder', mapDataJSON); // this callback function is stored in mapmarkers.js file

						});

						// on map legend section header click open linked modal and scroll window to it
						$('body').on('click', '.prometMapLegend__item .sectionHeader', function(){

							// get data-location param from clicked legend element
							var target = $(this).attr('data-location');

							// select map marker with data-location found earlier 
							var marker = $('.prometMap__marker[data-location="'+target+'"]');

							var markerName = marker.attr('data-marker-name');

							if (!window[markerName].modal.isModalActive()) {

								window[markerName].modal.openModal();

							}

							// scroll window to top of opened modal
							$('html, body').animate({
								scrollTop: $('.prometMap__marker[data-location="'+target+'"] .prometMap__markerContent').offset().top
							}, 1000);
							
						});

					})(jQuery);

				</script>

			</section>

		</div>

		<section class="prometMapLegend paddingTop">
			
			<div class="container">
				
				<div class="row">

					<div class="prometMapLegend__container">

						<?php foreach ($locations as $location => $location_value): ?>

							<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
								
								<div class="prometMapLegend__item paddingBottom">

									<h3 class="sectionHeader lineBefore marginBottom" data-location="<?php echo $location ?>">				
										<span class="iconAfterText iconAfterText--square">
											<?php echo $location ?>
										</span>
									</h3>

									<?php foreach ($location_value['members'] as $member => $member_details): ?>
										
										<div class="prometMapLegend__member">

											<div class="prometMapLegend__line">
												<?php echo $member ?>
											</div>
												
											<?php foreach ($member_details as $member_details_key => $member_details_value): ?>

												<?php if ($member_details_value): ?>
													<div class="prometMapLegend__line">
														<?php echo $member_details_key.": ". $member_details_value?>
													</div>
												<?php endif ?>
												
												
											<?php endforeach ?>

										</div>
										
									<?php endforeach ?>
									
								</div>

							</div>
							
					<?php endforeach ?>

					</div>

				</div>

			</div>

		</section>
		
	</body>
</html>
